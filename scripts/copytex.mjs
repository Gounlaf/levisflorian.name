import fs from 'fs'

const regex = /(?<before>[\S\s]+<code[^>]+>)(?<toreplace>[\S\s]*)(?<after><\/code>[\S\s]+)/gm

const indexContent = fs.readFileSync('src/index.html', 'utf8')
const texContent = fs.readFileSync('cv/CV.tex', 'utf8')

const result = indexContent.replace(regex, (match, before, toreplace, after) => {
  return `${before}${texContent}${after}`
})

fs.writeFileSync('src/index.html', result, {encoding: 'utf8'})
