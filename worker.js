// worker.js - Cloudflare Worker pour le stockage
export default {
  async fetch(request, env) {
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // GET - Récupérer une valeur
      if (request.method === 'GET' && path.startsWith('/storage/get/')) {
        const key = decodeURIComponent(path.replace('/storage/get/', ''));
        const value = await env.FLANA_STORAGE.get(key);
        
        if (value === null) {
          return new Response(JSON.stringify({ error: 'Key not found' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        return new Response(JSON.stringify({ key, value }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // POST - Sauvegarder une valeur
      if (request.method === 'POST' && path === '/storage/set') {
        const { key, value } = await request.json();
        
        if (!key || value === undefined) {
          return new Response(JSON.stringify({ error: 'Missing key or value' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        await env.FLANA_STORAGE.put(key, value);
        
        return new Response(JSON.stringify({ success: true, key, value }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // DELETE - Supprimer une valeur
      if (request.method === 'DELETE' && path.startsWith('/storage/delete/')) {
        const key = decodeURIComponent(path.replace('/storage/delete/', ''));
        await env.FLANA_STORAGE.delete(key);
        
        return new Response(JSON.stringify({ success: true, key, deleted: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // GET - Lister les clés avec un préfixe
      if (request.method === 'GET' && path.startsWith('/storage/list')) {
        const prefix = url.searchParams.get('prefix') || '';
        const list = await env.FLANA_STORAGE.list({ prefix });
        
        return new Response(JSON.stringify({ 
          keys: list.keys.map(k => k.name),
          prefix: prefix || undefined
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Route non trouvée
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};
