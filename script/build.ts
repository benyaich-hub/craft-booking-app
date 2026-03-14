import { build } from 'vite'
import path from 'path'

await build({
  root: path.resolve(import.meta.dirname, '..', 'client'),
})
