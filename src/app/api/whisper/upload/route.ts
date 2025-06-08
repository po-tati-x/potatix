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
    
    console.log('Processing file upload for whisper transcription');
    
    // Parse the multipart form data
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File | null;
    const language = formData.get('language') as string || 'en';

    if (!audioFile) {
      return NextResponse.json({ error: 'Audio file is required' }, { status: 400 });
    }

    console.log('File received:', audioFile.name, 'Type:', audioFile.type, 'Size:', audioFile.size);

    // Convert the file to base64
    const buffer = Buffer.from(await audioFile.arrayBuffer());
    const base64Audio = buffer.toString('base64');
    console.log('Base64 audio length:', base64Audio.length);

    // Determine MIME type from file
    const mimeType = audioFile.type || 'audio/wav';

    // Get environment variables
    const endpointId = process.env.GOOGLE_WHISPER_LARGE_ENDPOINT_ID;
    const projectId = process.env.GOOGLE_WHISPER_LARGE_PROJECT_ID;
    
    // Whisper API endpoint using the CORRECT endpoint format
    const endpoint = `https://${endpointId}.us-central1-${projectId}.prediction.vertexai.goog/v1/projects/${projectId}/locations/us-central1/endpoints/${endpointId}:predict`;
    
    console.log('Whisper endpoint:', endpoint);
    
    // Get token from environment variables
    const authToken = process.env.GOOGLE_AUTH_TOKEN;
    
    if (!authToken) {
      return NextResponse.json(
        { error: 'Authentication token not configured' },
        { status: 500 }
      );
    }
    
    // Try different payload formats to see what works
    const payloads = [
      // Format 1: Using "audio"
      {
        instances: [
          {
            audio: base64Audio,
            mime_type: mimeType,
            language
          }
        ]
      },
      // Format 2: Using "audio_base64"
      {
        instances: [
          {
            audio_base64: base64Audio,
            mime_type: mimeType,
            language
          }
        ]
      },
      // Format 3: Using "content"
      {
        instances: [
          {
            content: base64Audio,
            mimeType: mimeType,
            languageCode: language
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
            filename: audioFile.name,
            fileType: mimeType,
            fileSize: audioFile.size,
            language,
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
      hint: 'Check if the Whisper model is properly set up in Google Cloud Vertex AI',
      fileInfo: {
        filename: audioFile.name,
        fileType: mimeType,
        fileSize: audioFile.size
      }
    }, { status: 500 });
  } catch (error) {
    console.error('Error processing audio file:', error);
    return NextResponse.json(
      { error: 'Failed to process request', details: error instanceof Error ? error.message : String(error) }, 
      { status: 500 }
    );
  }
}

// Configure the API route to handle large files
export const config = {
  api: {
    bodyParser: false,
    responseLimit: '50mb',
  },
}; 