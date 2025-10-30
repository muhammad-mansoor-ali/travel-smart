/* js/site.js - shared UI helpers and catalog logic */
(function(){
  // small helpers
  window.cap = s => s.charAt(0).toUpperCase()+s.slice(1);
  window.emojiFor = type=>{
    if(type==='beach') return '🏖️';
    if(type==='mountain') return '🏔️';
    if(type==='city') return '🏙️';
    if(type==='adventure') return '🧭';
    return '✈️';
  };

  // Render catalog - expects certain DOM elements to exist
  window.renderCatalog = function(opts){
    const container = document.getElementById('catalogGrid');
    if(!container) return;
    const q = (document.getElementById('catalogSearch')?.value||'').trim().toLowerCase();
    const type = document.getElementById('filterType')?.value || 'all';
    const maxPrice = Number(document.getElementById('filterMaxPrice')?.value) || Infinity;
    const minRating = Number(document.getElementById('filterMinRating')?.value) || 0;
    const sortBy = document.getElementById('sortBy')?.value || 'popular';

    let results = (window.TRAVEL_DATA || []).filter(p=>{
      if(type!=='all' && p.type !== type) return false;
      if(p.price > maxPrice) return false;
      if(p.rating < minRating) return false;
      if(q){
        return p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.type.includes(q);
      }
      return true;
    });

    if(sortBy==='price-asc') results.sort((a,b)=>a.price-b.price);
    else if(sortBy==='price-desc') results.sort((a,b)=>b.price-a.price);
    else if(sortBy==='alpha') results.sort((a,b)=>a.name.localeCompare(b.name));
    else if(sortBy==='rating') results.sort((a,b)=>b.rating-a.rating);
    else results.sort((a,b)=>b.popularity - a.popularity);

    document.getElementById('catalogInfo').textContent = `Showing ${results.length} package(s)`;

    container.innerHTML = results.length ? results.map(p=>`
      <article class="tour-card">
        <div class="tour-media" style="background-image: linear-gradient(rgba(0,0,0,0.08), rgba(0,0,0,0.02)), url('${p.hero}'); background-size:cover; background-position:center;">
          <div style="font-size:34px;padding:8px;background:rgba(255,255,255,0.85);border-radius:8px;">${emojiFor(p.type)}</div>
        </div>
        <div class="tour-body">
          <div style="display:flex;justify-content:space-between;align-items:flex-start">
            <div>
              <div style="font-weight:700">${p.name}</div>
              <div class="small">${p.duration} days • ${cap(p.type)}</div>
            </div>
            <div style="text-align:right">
              <div style="font-weight:800">$${p.price}</div>
              <div class="small">⭐ ${p.rating}</div>
            </div>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px">
            <div class="badge">${p.popularity}% popular</div>
            <div style="display:flex;gap:8px">
              <a class="small" href="details.html?id=${p.id}">View</a>
              <button class="btn" onclick="alert('Demo booking for: ${p.name}\\nThis is non-persistent')">Book</button>
            </div>
          </div>
        </div>
      </article>
    `).join('') : '<div class="small">No packages match your criteria.</div>';
  };

  // small init for pages that have catalog
  document.addEventListener('DOMContentLoaded', ()=>{
    if(document.getElementById('catalogGrid')) renderCatalog();
    // allow pressing Enter in global search (if present)
    const g = document.getElementById('globalSearch');
    if(g) g.addEventListener('keydown', e=>{ if(e.key==='Enter'){ const v = g.value.trim(); window.location = 'catalog.html?query='+encodeURIComponent(v); }});
  });

  // Details page fetch by id
  window.renderDetails = function(){
    const el = document.getElementById('detailsContent');
    if(!el) return;
    const params = new URLSearchParams(location.search);
    const id = Number(params.get('id')||0);
    const p = (window.TRAVEL_DATA||[]).find(x=>x.id===id);
    if(!p){ el.innerHTML = '<div class="card">Package not found. <a href="catalog.html">Back to catalog</a></div>'; return; }
    el.innerHTML = `
      <div class="details-hero" style="background-image:linear-gradient(rgba(2,6,23,0.2), rgba(2,6,23,0.05)), url('${p.hero}')">
        <div style="padding:18px;background:linear-gradient(90deg, rgba(0,0,0,0.2), transparent);width:100%">
          <h2 style="margin:0">${p.name}</h2>
          <div class="small"> ${p.duration} days • ${p.type} • ⭐ ${p.rating}</div>
        </div>
      </div>
      <div class="details-grid">
        <div class="card">
          <h3>Overview</h3>
          <p>${p.description}</p>
          <ul>
            <li>Guided activities</li>
            <li>Accommodation included</li>
            <li>Selected meals</li>
          </ul>
          <div style="margin-top:12px" class="row">
            <div class="btn" onclick="alert('Booking demo for ${p.name}. Not saved')">Book Now</div>
            <a class="small" href="review.html#package-${p.id}">Leave a review</a>
          </div>
        </div>
        <div class="card">
          <h3>Details</h3>
          <p><strong>Price:</strong> $${p.price}</p>
          <p><strong>Rating:</strong> ${p.rating}</p>
          <p><strong>Popularity:</strong> ${p.popularity}%</p>
        </div>
      </div>
    `;
  };

  // simple review store (in-memory)
  window.REVIEWS = window.REVIEWS || {};
  window.postReview = function(packageId, rating, text){
    if(!window.REVIEWS[packageId]) window.REVIEWS[packageId]=[];
    window.REVIEWS[packageId].push({rating, text, date:new Date().toLocaleString()});
  };
  window.getReviewsFor = function(packageId){ return window.REVIEWS[packageId]||[]; };

})();
