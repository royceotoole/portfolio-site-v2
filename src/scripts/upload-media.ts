import { supabase } from '../lib/supabase'
import path from 'path'
import fs from 'fs'

async function uploadFile(filePath: string, bucket: 'project-media' | 'screensaver') {
  const fileName = path.basename(filePath)
  const fileData = fs.readFileSync(filePath)
  const fileExt = path.extname(fileName)
  const timestamp = Date.now()
  const uniqueFileName = `${path.basename(fileName, fileExt)}-${timestamp}${fileExt}`

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(uniqueFileName, fileData)

  if (error) {
    console.error('Error uploading file:', error)
    return null
  }

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(uniqueFileName)

  return publicUrl
}

async function uploadProjectMedia(projectDir: string) {
  const files = fs.readdirSync(projectDir)
  const urls: string[] = []

  for (const file of files) {
    if (file.match(/\.(jpg|jpeg|png|gif)$/i)) {
      const url = await uploadFile(path.join(projectDir, file), 'project-media')
      if (url) urls.push(url)
    }
  }

  return urls
}

async function uploadScreensaver(screensaverDir: string) {
  const files = fs.readdirSync(screensaverDir)
  const urls: string[] = []

  for (const file of files) {
    if (file.match(/\.(jpg|jpeg|png|gif)$/i)) {
      const url = await uploadFile(path.join(screensaverDir, file), 'screensaver')
      if (url) urls.push(url)
    }
  }

  return urls
}

// Example usage:
// uploadProjectMedia('./media/project-name')
// uploadScreensaver('./media/screensaver') 