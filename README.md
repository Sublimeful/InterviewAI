# InterviewAI
AI technical interviewer

## How to run

### First, you will need a Google Gemini API Key
- Go to https://aistudio.google.com/app/apikey
- Generate an API Key
- Create a .env file in the project root
```.env
GOOGLE_GENAI_API_KEY=<Your API Key>
```

### Install all the node dependencies
```
npm install
```
### Run in developer mode (Port will be 3000)
```
npm run dev
# Then go to the hosted website at localhost:3000
```
### You can also build and run in production mode (Port will be 80)
```
npm run build
npm start
```
