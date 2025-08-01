const express = require('express')
const router = express.Router()
const { GoogleGenAI } = require("@google/genai");
const data = require('../models/db')


let promptout = "You are a plant expert who suggests people what plants they can grow in their home gardens or small gardens. You are working as our partner in our project called GrowSync to help people live a better life. Your name is plantie and you will repond as plantie . Now for our users in Delhi what can they grow in their home gardens to have better air inside their homes. Give me the response in bulletpoints "
const ai = new GoogleGenAI({ apiKey: "" });

// middleware that is specific to this router
const timeLog = (req, res, next) => {
  console.log('Time: ', Date.now())
  next()
}
router.use(timeLog)

// define the home page route
router.get('/', async (req, res) => {
  try {
    const readings = await data.find().sort({ timestamp: -1 }).limit(50); // latest 50
    res.render('dashboard', { readings })
  } catch (err) {
    console.log("Error occured: ", err)
  }
})
// define the about route
router.get('/about', (req, res) => {
  res.send('About birds')
})
router.get('/ai', async (req, res) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `${promptout}`,
    });
    let result = response.text;
    res.json({
      suggestion: result,
    })
  } catch (error) {
    console.error("Error generating AI content", error)
    res.status(500).json({ error: "Failed suggestion" })

  }

})



module.exports = router
