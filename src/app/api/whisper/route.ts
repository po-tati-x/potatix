import { NextRequest, NextResponse } from 'next/server';

// Custom authentication middleware
function authenticateRequest(request: NextRequest): boolean {
  const authHeader = request.headers.get('x-api-key');
  return authHeader === process.env.GOOGLE_CUSTOM_SECRET;
}

export async function POST(request: NextRequest) {
  try {
    // Check custom authentication
    if (!authenticateRequest(request)) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid API key' },
        { status: 401 }
      );
    }
    
    // Get audio data from request body
    const body = await request.json();
    const { audioData, language } = body;

    if (!audioData) {
      return NextResponse.json({ error: 'Audio data is required' }, { status: 400 });
    }

    // Log debug info
    console.log('Request received for Whisper processing');
    console.log('Language:', language || 'en');
    console.log('Audio data length:', audioData.length);

    // Clean up base64 string if it includes the data URI prefix
    const base64Audio = audioData.startsWith('data:') 
      ? audioData.split(',')[1] 
      : audioData;
    
    console.log('Base64 audio length after cleanup:', base64Audio.length);

    // Get environment variables
    const endpointId = process.env.GOOGLE_WHISPER_LARGE_ENDPOINT_ID;
    const projectId = process.env.GOOGLE_WHISPER_LARGE_PROJECT_ID;
    
    // Whisper API endpoint using the CORRECT endpoint format
    const endpoint = `https://${endpointId}.us-central1-${projectId}.prediction.vertexai.goog/v1/projects/${projectId}/locations/us-central1/endpoints/${endpointId}:predict`;
    
    console.log('Whisper endpoint:', endpoint);
    
    // Update token value with the latest token
    const authToken = "REDACTED_GOOGLE_TOKEN";
    
    // Try different payload formats to see what works
    // We've tried multiple formats but keep getting 500 errors
    // This suggests it might be an issue with the Whisper model setup
    const payloads = [
      // Format 1: Using "audio"
      {
        instances: [
          {
            audio: base64Audio,
            mime_type: "audio/wav",
            language: language || "en"
          }
        ]
      },
      // Format 2: Using "audio_base64"
      {
        instances: [
          {
            audio_base64: base64Audio,
            mime_type: "audio/wav",
            language: language || "en"
          }
        ]
      },
      // Format 3: Using "content"
      {
        instances: [
          {
            content: base64Audio,
            mimeType: "audio/wav",
            languageCode: language || "en"
          }
        ]
      },
      // Format 4: Minimal payload
      {
        instances: [
          {
            data: base64Audio
          }
        ]
      }
    ];
    
    // Try each payload format
    for (let i = 0; i < payloads.length; i++) {
      const payload = payloads[i];
      console.log(`Trying payload format ${i + 1}`);
      
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
        
        console.log(`Format ${i + 1} response status:`, response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Whisper API response data:', JSON.stringify(data));
          
          return NextResponse.json({
            transcription: data.predictions?.[0]?.text || data.predictions?.[0]?.transcript || 'No transcription available',
            raw: data,
            successfulFormat: i + 1
          });
        }
        
        // If we get here, this format didn't work, try the next one
      } catch (formatError) {
        console.error(`Error with format ${i + 1}:`, formatError);
        // Continue to the next format
      }
    }
    
    // If we get here, all formats failed
    return NextResponse.json({
      error: 'All payload formats failed',
      details: 'The Whisper API endpoint returned errors for all attempted payload formats',
      hint: 'Check if the Whisper model is properly set up in Google Cloud Vertex AI'
    }, { status: 500 });
    
  } catch (error) {
    console.error('Error calling Whisper API:', error);
    return NextResponse.json(
      { error: 'Failed to process request', details: error instanceof Error ? error.message : String(error) }, 
      { status: 500 }
    );
  }
} 