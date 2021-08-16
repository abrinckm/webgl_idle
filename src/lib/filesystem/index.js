import devnull from 'dev-null'

let _fs, _readline // , _path
if (window && window.require)
{
  _fs = window.require ('fs')
  _readline = window.require ('readline')
  // _path = window.require ('path')
} 
else
{
  throw new Error ('Cannot import nodejs')
}
const fs = _fs
const readline = _readline
// const path = _path

function readFileSync (filePath)
{
  filePath = filePath.replace ('@', '.')
  return fs.readFileSync (filePath)
}

function readLine (filePath, cb)
{
  filePath = filePath.replace ('@', '.')
  const rStream = fs.createReadStream (filePath)
  rStream.on ('error', cb.bind (null, null))
  const readInterface = readline.createInterface ({
    input: rStream,
    output: devnull (),
    console: false
  })
  readInterface.on ('line', cb)
  readInterface.on ('close', cb)
}

function loadImage (filePath, image, cb)
{
  image.onload = cb
  image.src = 'data:image/png;base64,' + readFileSync (filePath).toString ('base64')
}

export {
  readFileSync,
  readLine,
  loadImage
}