/**
 * Enforces the two conventions a type checker cannot:
 *
 *   1. No user-facing text outside `src/i18n` — otherwise switching language
 *      later means hunting through components.
 *   2. No physical direction utilities — RTL must hold structurally, so the
 *      layout flips with `dir` alone.
 *
 * Run via `npm run audit` (included in `npm run check`).
 */
import { readdirSync, readFileSync } from 'node:fs'
import { join, posix, sep } from 'node:path'

const SOURCE_ROOT = 'src'
const SCANNED_EXTENSIONS = ['.ts', '.tsx']

/** The dictionary is the only place allowed to contain Hebrew. */
const TEXT_EXEMPT_PREFIXES = ['src/i18n/']

const HEBREW_CHARACTER = /[֐-׿]/

/** `ml-4`, `-mr-2`, `left-0`, `text-right`, `border-l`, `rounded-r-md`, `float-left`. */
const PHYSICAL_DIRECTION = new RegExp(
  [
    '(?<![\\w-])-?(?:ml|mr|pl|pr)-[\\w./[\\]-]+',
    '(?<![\\w-])-?(?:left|right)-[\\w./[\\]-]+',
    '(?<![\\w-])text-(?:left|right)(?![\\w-])',
    '(?<![\\w-])(?:border|rounded)-[lr](?![\\w-])',
    '(?<![\\w-])(?:border|rounded)-[lr]-[\\w./[\\]-]+',
    '(?<![\\w-])float-(?:left|right)(?![\\w-])',
  ].join('|'),
)

function collectSourceFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) return collectSourceFiles(path)
    return SCANNED_EXTENSIONS.some((extension) => entry.name.endsWith(extension))
      ? [path]
      : []
  })
}

const violations = []

for (const path of collectSourceFiles(SOURCE_ROOT)) {
  const relativePath = path.split(sep).join(posix.sep)
  const isTextExempt = TEXT_EXEMPT_PREFIXES.some((prefix) =>
    relativePath.startsWith(prefix),
  )
  const lines = readFileSync(path, 'utf8').split('\n')

  lines.forEach((line, index) => {
    const location = `${relativePath}:${index + 1}`

    if (!isTextExempt && HEBREW_CHARACTER.test(line)) {
      violations.push({ location, rule: 'hardcoded text', line: line.trim() })
    }

    const physicalMatch = line.match(PHYSICAL_DIRECTION)
    if (physicalMatch) {
      violations.push({
        location,
        rule: `physical direction "${physicalMatch[0]}"`,
        line: line.trim(),
      })
    }
  })
}

if (violations.length === 0) {
  console.log('audit: clean')
  process.exit(0)
}

console.error(`audit: ${violations.length} violation(s)\n`)
for (const { location, rule, line } of violations) {
  console.error(`  ${location}\n    ${rule}\n    ${line}\n`)
}
process.exit(1)
