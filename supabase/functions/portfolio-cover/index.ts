import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Helper function to ensure URL has protocol
function normalizeUrl(url: string): string {
  if (!url) return url
  
  // If URL doesn't start with protocol, add https://
  if (!url.match(/^https?:\/\//)) {
    return `https://${url}`
  }
  
  return url
}

// Helper function to get content type from URL or response
function getContentType(url: string, responseHeaders?: Headers): string {
  if (responseHeaders?.get('content-type')) {
    return responseHeaders.get('content-type')!
  }
  
  const extension = url.split('.').pop()?.toLowerCase()
  switch (extension) {
    case 'png': return 'image/png'
    case 'jpg':
    case 'jpeg': return 'image/jpeg'
    case 'gif': return 'image/gif'
    case 'webp': return 'image/webp'
    default: return 'image/jpeg'
  }
}

// Screenshot providers configuration
const SCREENSHOT_PROVIDERS = {
  microlink: {
    name: 'Microlink',
    url: (url: string) => `https://api.microlink.io/screenshot?url=${encodeURIComponent(url)}&type=png&viewport.width=1200&viewport.height=630`,
    headers: {},
    free: true
  },
  apiflash: {
    name: 'APIFlash',
    url: (url: string, apiKey: string) => `https://api.apiflash.com/v1/urltoimage?access_key=${apiKey}&url=${encodeURIComponent(url)}&width=1200&height=630&format=png`,
    headers: {},
    free: true
  },
  screenshotmachine: {
    name: 'ScreenshotMachine',
    url: (url: string, apiKey: string) => `https://api.screenshotmachine.com?key=${apiKey}&url=${encodeURIComponent(url)}&dimension=1200x630&format=png`,
    headers: {},
    free: true
  },
  screenshotone: {
    name: 'ScreenshotOne',
    url: (url: string, apiKey: string) => `https://api.screenshotone.com/take?access_key=${apiKey}&url=${encodeURIComponent(url)}&viewport_width=1200&viewport_height=630&format=png`,
    headers: {},
    free: false
  },
  urlbox: {
    name: 'URLBox',
    url: (url: string, publicKey: string) => `https://api.urlbox.io/v1/${publicKey}/png?url=${encodeURIComponent(url)}&width=1200&height=630&quality=80`,
    headers: (secretKey: string) => ({ 'Authorization': `Bearer ${secretKey}` }),
    free: false
  }
};

async function generateScreenshot(url: string, provider: string = 'microlink'): Promise<{ buffer: ArrayBuffer, contentType: string, source: string } | null> {
  const providerConfig = SCREENSHOT_PROVIDERS[provider as keyof typeof SCREENSHOT_PROVIDERS];
  if (!providerConfig) {
    console.error(`Unknown screenshot provider: ${provider}`);
    return null;
  }

  console.log(`Using ${providerConfig.name} for screenshot generation...`);

  try {
    let screenshotUrl: string;
    let headers: Record<string, string> = {};

    if (provider === 'microlink') {
      screenshotUrl = providerConfig.url(url);
    } else {
      const apiKey = Deno.env.get('SCREENSHOT_API_KEY');
      if (!apiKey) {
        console.error(`API key required for ${providerConfig.name} but not found`);
        return null;
      }

      if (provider === 'urlbox') {
        const [publicKey, secretKey] = apiKey.split('/');
        if (!publicKey || !secretKey) {
          console.error('URLBox requires format: publicKey/secretKey');
          return null;
        }
        screenshotUrl = providerConfig.url(url, publicKey);
        headers = providerConfig.headers(secretKey);
      } else {
        screenshotUrl = (providerConfig as any).url(url, apiKey);
      }
    }

    console.log(`Requesting screenshot from: ${screenshotUrl.substring(0, 100)}...`);
    const response = await fetch(screenshotUrl, { headers });

    if (response.ok) {
      const buffer = await response.arrayBuffer();
      
      // Validate screenshot - must be at least 1KB and valid image type
      const contentType = response.headers.get('content-type') || 'image/png';
      if (buffer.byteLength < 1024) {
        console.warn(`${providerConfig.name} returned very small image (${buffer.byteLength} bytes), likely invalid`);
        return null;
      }
      
      if (!contentType.startsWith('image/')) {
        console.warn(`${providerConfig.name} returned non-image content type: ${contentType}`);
        return null;
      }
      
      console.log(`Successfully generated screenshot with ${providerConfig.name} (${buffer.byteLength} bytes)`);
      return {
        buffer,
        contentType,
        source: `screenshot-${provider}`
      };
    } else {
      console.error(`${providerConfig.name} API error: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error(`${providerConfig.name} error details:`, errorText);
      return null;
    }
  } catch (error) {
    console.error(`${providerConfig.name} screenshot generation failed:`, error.message);
    return null;
  }
}

async function generateScreenshotWithFallback(url: string, primaryProvider: string = 'apiflash'): Promise<{ buffer: ArrayBuffer, contentType: string, source: string } | null> {
  const providers = [primaryProvider, 'microlink', 'apiflash', 'screenshotmachine'];
  const uniqueProviders = [...new Set(providers)]; // Remove duplicates
  
  for (const provider of uniqueProviders) {
    if (SCREENSHOT_PROVIDERS[provider as keyof typeof SCREENSHOT_PROVIDERS]) {
      console.log(`Trying provider: ${provider}`);
      const result = await generateScreenshot(url, provider);
      if (result) {
        return result;
      }
    }
  }
  
  console.error('All screenshot providers failed');
  return null;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mode = 'auto', url, projectId, provider = 'apiflash' } = await req.json();
    console.log(`Generating cover for URL: ${url}, mode: ${mode}, provider: ${provider}, projectId: ${projectId}`);

    if (!url || !projectId) {
      console.error('Missing required parameters:', { url, projectId });
      return new Response(
        JSON.stringify({ error: 'URL and projectId are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const normalizedUrl = normalizeUrl(url);
    console.log(`Normalized URL: ${normalizedUrl}`);
    
    let imageBuffer: ArrayBuffer | null = null;
    let contentType = 'image/png';
    let source = '';

    // Try to get OpenGraph image or favicon first (unless mode is specifically 'screenshot')
    if (mode !== 'screenshot') {
      try {
        console.log('Attempting to fetch webpage for OpenGraph/favicon extraction...');
        const response = await fetch(normalizedUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        });
        
        if (response.ok) {
          const html = await response.text();
          console.log('Successfully fetched webpage HTML');
          
          // Try to extract OpenGraph image
          const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["'][^>]*>/i) ||
                               html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["'][^>]*>/i);
          
          if (ogImageMatch && ogImageMatch[1]) {
            const ogImageUrl = ogImageMatch[1].startsWith('http') ? ogImageMatch[1] : new URL(ogImageMatch[1], normalizedUrl).toString();
            console.log(`Found OpenGraph image: ${ogImageUrl}`);
            
            try {
              const imageResponse = await fetch(ogImageUrl);
              if (imageResponse.ok) {
                imageBuffer = await imageResponse.arrayBuffer();
                contentType = getContentType(ogImageUrl, imageResponse.headers);
                source = 'opengraph';
                console.log(`Successfully fetched OpenGraph image (${contentType})`);
              }
            } catch (error) {
              console.log(`Failed to fetch OpenGraph image: ${error.message}`);
            }
          }
          
          // If no OpenGraph image, try favicon
          if (!imageBuffer) {
            console.log('No OpenGraph image found, trying favicon...');
            const faviconMatches = [
              html.match(/<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']+)["'][^>]*>/i),
              html.match(/<link[^>]*href=["']([^"']+)["'][^>]*rel=["'](?:shortcut )?icon["'][^>]*>/i)
            ];
            
            for (const match of faviconMatches) {
              if (match && match[1]) {
                const faviconUrl = match[1].startsWith('http') ? match[1] : new URL(match[1], normalizedUrl).toString();
                console.log(`Found favicon: ${faviconUrl}`);
                
                try {
                  const faviconResponse = await fetch(faviconUrl);
                  if (faviconResponse.ok) {
                    imageBuffer = await faviconResponse.arrayBuffer();
                    contentType = getContentType(faviconUrl, faviconResponse.headers);
                    source = 'favicon';
                    console.log(`Successfully fetched favicon (${contentType})`);
                    break;
                  }
                } catch (error) {
                  console.log(`Failed to fetch favicon: ${error.message}`);
                }
              }
            }
          }
        } else {
          console.log(`Failed to fetch webpage: ${response.status} ${response.statusText}`);
        }
      } catch (error) {
        console.log(`Error fetching webpage: ${error.message}`);
      }
    }

    // If no image found or mode is 'screenshot' or 'auto', try screenshot with fallback
    if (!imageBuffer && (mode === 'screenshot' || mode === 'auto')) {
      console.log('Attempting to generate screenshot...');
      
      const screenshotResult = await generateScreenshotWithFallback(normalizedUrl, provider);
      if (screenshotResult) {
        imageBuffer = screenshotResult.buffer;
        contentType = screenshotResult.contentType;
        source = screenshotResult.source;
      } else if (mode === 'screenshot') {
        return new Response(
          JSON.stringify({ 
            error: `Failed to generate screenshot with all providers. Please check if the URL is accessible and try again.`
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    if (!imageBuffer) {
      console.error('No image could be generated or found');
      return new Response(
        JSON.stringify({ 
          error: mode === 'screenshot' 
            ? `Failed to generate screenshot with all providers. Please check the URL and try again.`
            : 'No suitable image found. The website may not have an OpenGraph image, favicon, or may not be accessible for screenshots.'
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Upload to Supabase Storage
    console.log(`Uploading ${source} image to storage...`);
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const fileName = `${projectId}-cover-${Date.now()}.${contentType.split('/')[1]}`;
    const { data, error } = await supabase.storage
      .from('portfolio-images')
      .upload(fileName, imageBuffer, {
        contentType,
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Storage upload error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to upload image to storage' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('portfolio-images')
      .getPublicUrl(fileName);

    console.log(`Successfully uploaded ${source} image:`, publicUrl);
    
    return new Response(
      JSON.stringify({ 
        imageUrl: publicUrl,
        source,
        provider: source.includes('screenshot') ? provider : 'webpage',
        message: `Successfully generated cover image from ${source}`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred while generating the cover image' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
})