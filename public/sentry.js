/* -- Neural Sentry: Advanced Browser & Machine Identity Sensor -- */
(async function() {
  try {
    // 1. Unique ID Persistence (Virtual Identity)
    let vid = localStorage.getItem('gravity_vid');
    if (!vid) {
        vid = 'V-' + Math.random().toString(36).substring(2, 9).toUpperCase();
        localStorage.setItem('gravity_vid', vid);
    }

    // 2. Machine Fingerprinting (Hardware Core Signature)
    const collectTelemetry = () => {
       const components = [
          navigator.hardwareConcurrency || 0,
          navigator.deviceMemory || 0,
          screen.width + "x" + screen.height,
          screen.colorDepth,
          Intl.DateTimeFormat().resolvedOptions().timeZone,
          navigator.language
       ];
       
       // Canvas Artifact Detection
       try {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          ctx.textBaseline = "top"; ctx.font = "14px 'Arial'"; 
          ctx.fillText("Gravity Sentry Neural Link", 2, 2);
          ctx.fillStyle = "rgba(88, 101, 242, 0.5)";
          ctx.fillRect(100, 5, 50, 50);
          components.push(canvas.toDataURL().slice(-50)); // Last 50 chars of the base64
       } catch (e) {}
       
       const raw = components.join('|');
       let hash = 0;
       for (let i = 0; i < raw.length; i++) hash = ((hash << 5) - hash) + raw.charCodeAt(i);
       return 'FP-' + Math.abs(hash).toString(16).toUpperCase().slice(0, 8);
    };
    
    const fp = collectTelemetry();

    // 3. Secure Transmission to Vercel Sentry API
    // The server handles the Supabase injection and Geo-Detection.
    const res = await fetch('/api/sentry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vid: vid, fp: fp, path: window.location.pathname })
    }).then(r => r.json());

    window.gravityLocal = res;
    console.log('📡 Neural Identity Synchronized:', res.vid, res.fp);

  } catch (e) { console.debug('Neural Sentry suppressed:', e); }
})();
