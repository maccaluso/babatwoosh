import './index.css';

import { HfInference } from '@huggingface/inference'
const hf = new HfInference('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', { use_cache: false, use_gpu: true })
import { PowerGlitch } from 'powerglitch'

const { startGlitch, stopGlitch } = PowerGlitch.glitch('.glitch')
stopGlitch()

const background = document.getElementById('background')
const glitchLayers = document.querySelectorAll('.glitch')
const textContainer = document.getElementById('textContainer')

const expandAnswer = async (value) => {
  const output = await hf.textGeneration({
    // model: 'bigscience/bloom',
    model: 'gpt2',
    inputs: value,
    // parameters: { max_new_tokens: 250 }
  })

  return output.generated_text
}

const generateBackground = async () => {
  const blob = await hf.textToImage({
    model: 'stabilityai/stable-diffusion-2',
    // inputs: 'A realistic urban picture showing (graffiti tags) and rugged walls, dark gothic look, violet tone, avoid stock footage watermarks',
    // inputs: 'A realistic, high resolution image of a cyberpunk city alley with violet and green lights, cables falling from top, dark shadows',
    inputs: 'A realistic, high resolution image of a door on a rugged and textured concrete wall with icelandic graffiti tags, [[old stickers and flyers]], dark green tone with a touch of sepia',
    parameters: {
      negative_prompt: 'bright colors, blurry, stock footage watermarks',
    }
  })

  const reader = new FileReader()
  reader.readAsDataURL(blob)
  reader.onloadend = function() {
    const base64data = reader.result

    background.style.backgroundImage = 'url(' + base64data + ')'
    glitchLayers.forEach((l, i) => {
      console.log(i)

      if (i | 0) { l.style.backgroundImage = 'url(' + base64data + ')' }
    })
  }
}

window.electronAPI.onGenerate(async (_event, value) => {
  textContainer.style.opacity = 0
  glitchLayers.forEach(l => { l.style.opacity = 1 })
  
  startGlitch()
  await generateBackground()
  textContainer.innerText = await expandAnswer(value)
  stopGlitch()

  glitchLayers.forEach(l => { l.style.opacity = 0 })
  textContainer.style.opacity = 1
})
