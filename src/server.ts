// Local development
import 'dotenv/config' // To load the .env variables for local development
import app from './app.ts'

const PORT = process.env.HTTP_PORT || 3000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
