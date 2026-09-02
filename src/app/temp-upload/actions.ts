
'use server';

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export async function uploadToR2(fileBase64: string, fileName: string, mimeType: string, config: any) {
  try {
    const { accountId, accessKey, secretKey, bucket, publicUrl } = config;
    const client = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
      },
    });

    const buffer = Buffer.from(fileBase64.split(',')[1], 'base64');
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: fileName,
      Body: buffer,
      ContentType: mimeType,
    });

    await client.send(command);
    const finalUrl = `${publicUrl.endsWith('/') ? publicUrl : publicUrl + '/'}${fileName}`;
    return { success: true, url: finalUrl };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function uploadToImgBB(fileBase64: string, apiKey: string) {
  try {
    const formData = new FormData();
    formData.append('image', fileBase64.split(',')[1]);
    
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: 'POST',
      body: formData,
    });
    
    const result = await response.json();
    if (!response.ok) throw new Error(result.error?.message || 'ImgBB Upload Failed');
    return { success: true, url: result.data.url };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function uploadToPixeldrain(fileBase64: string, fileName: string, apiKey: string) {
  try {
    const buffer = Buffer.from(fileBase64.split(',')[1], 'base64');
    const formData = new FormData();
    formData.append('file', new Blob([buffer]), fileName);

    const response = await fetch('https://pixeldrain.com/api/file', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(':' + apiKey).toString('base64'),
      },
      body: formData
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Pixeldrain Upload Failed');
    return { success: true, url: `https://pixeldrain.com/u/${result.id}` };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function uploadToGoFile(fileBase64: string, fileName: string, token?: string) {
  try {
    // 1. Get Server
    const serverRes = await fetch('https://api.gofile.io/servers');
    const serverData = await serverRes.json();
    const server = serverData.data.servers[0].name;

    // 2. Upload
    const buffer = Buffer.from(fileBase64.split(',')[1], 'base64');
    const formData = new FormData();
    formData.append('file', new Blob([buffer]), fileName);
    if (token) formData.append('token', token);

    const response = await fetch(`https://${server}.gofile.io/contents/uploadfile`, {
      method: 'POST',
      body: formData
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'GoFile Upload Failed');
    return { success: true, url: result.data.downloadPage };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function uploadToCustom(fileBase64: string, fileName: string, config: any) {
  try {
    const { url, apiKey, headerKey, responsePath } = config;
    const buffer = Buffer.from(fileBase64.split(',')[1], 'base64');
    const formData = new FormData();
    formData.append('file', new Blob([buffer]), fileName);

    const headers: any = {};
    if (headerKey && apiKey) headers[headerKey] = apiKey;

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData
    });

    const result = await response.json();
    
    // Resolve path (e.g. data.url)
    const resolve = (obj: any, path: string) => path.split('.').reduce((p, c) => p && p[c], obj);
    const link = resolve(result, responsePath);

    if (!link) throw new Error("Could not isolate link in response matrix.");
    return { success: true, url: link };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
