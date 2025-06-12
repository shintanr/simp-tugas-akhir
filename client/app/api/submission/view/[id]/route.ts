import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  
  try {
    // Proxy ke backend Express 
    // Api untuk melihat file submission ke halaman preview
    const response = await fetch(`http://localhost:8080/api/submission/view/${id}`);
    
    if (!response.ok) {
      return new NextResponse('File not found', { status: 404 });
    }
    
    const contentType = response.headers.get('content-type');
    const buffer = await response.arrayBuffer();
    
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType || 'application/octet-stream',
        'Content-Disposition': 'inline',
      },
    });
  } catch (error) {
    console.error('Error proxying file:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Handle HEAD request
export async function HEAD(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  
  try {
    const response = await fetch(`http://localhost:8080/api/submission/view/${id}`, {
      method: 'HEAD'
    });
    
    if (!response.ok) {
      return new NextResponse(null, { status: 404 });
    }
    
    const contentType = response.headers.get('content-type');
    
    return new NextResponse(null, {
      headers: {
        'Content-Type': contentType || 'application/octet-stream',
      },
    });
  } catch (error) {
    console.error('Error checking file:', error);
    return new NextResponse(null, { status: 500 });
  }
}