/*
import platform from './img/platform.png'
import hills from './img/hills.png'
import background from './img/background.png'
import platformSmallTall from './img/platformSmallTall.png'
import spriteRunLeft from './img/spriteRunLeft.png'
import spriteRunRight from './img/spriteRunRight.png'
import spriteStandLeft from './img/spriteStandLeft.png'
import spriteStandRight from './img/spriteStandRight.png'
*/


const background = document.getElementById('background')
const hills = document.getElementById('hills')
const platform = document.getElementById('platform')
const platformSmallTall = document.getElementById('platformSmallTall')
const spriteRunLeft = document.getElementById('spriteRunLeft')
const spriteRunRight = document.getElementById('spriteRunRight')
const spriteStandLeft = document.getElementById('spriteStandLeft')
const spriteStandRight = document.getElementById('spriteStandRight')

const canvas = document.querySelector('canvas')

const c = canvas.getContext('2d')

// 16 x 9 ASPECT RATIO
canvas.width = 1024
canvas.height = 576

const gravity = 0.5

class Player {
  constructor() {
    this.speed = 10
    this.position = {
      x: 100,
      y: 100
    }
    this.velocity = {
      x: 0,
      y: 0
    }
    this.width = 66
    this.height = 150

    this.image = spriteStandRight
    this.frames = 0 // This represents the current frame within the player animation
    
    this.sprites = { // This will contain the sprites associated with each action the player takes
      stand: {
        right: spriteStandRight,
        left: spriteStandLeft,
        cropWidth: 177, // Unfortunately, the sprites are different sizes, so we need to have a cropWidth property for each sprite instead of simply relying on the source variables in .drawImage()
        width: 66
      },
      run: {
        right: spriteRunRight,
        left: spriteRunLeft,
        cropWidth: 341,
        width: 127.875
      }
    }

    // The sprite and cropWidth will change when the player changes to a new action
    this.currentSprite = this.sprites.stand.right 
    this.currentCropWidth = this.sprites.stand.cropWidth
  }

  draw() {
    // c.fillStyle = 'red'
    // c.fillRect(this.position.x, this.position.y, this.width, this.height)
    
    c.drawImage( //  When cropping an image, .drawImage() takes 9 arguments -- the first is the image to be cropped, then next 4 are the dimensions for the cropping, and the final 4 are for drawing the cropped image on the canvas
    this.currentSprite, // The image to be cropped
    this.currentCropWidth * this.frames, // Source X: The x position to begin the crop on the original image
    0, // Source Y: The y position to begin the crop 
    this.currentCropWidth, // Source width: where to end the crop horizontally
    400, // Source height: where to end the crop vertically
    this.position.x, // Destination X
    this.position.y, // Destination Y
    this.width, // Destination width
    this.height // Destination height 
    ) 
  }


  update() {
    this.frames += 1 // Player animation frames
    if (this.frames > 59 && (this.currentSprite === this.sprites.stand.right || this.currentSprite === this.sprites.stand.left)) this.frames = 0
    else if (this.frames > 29 && (this.currentSprite === this.sprites.run.right || this.currentSprite === this.sprites.run.left)) this.frames = 0

    this.draw()
    this.position.x += this.velocity.x
    this.position.y += this.velocity.y

    // This prevents the player from falling below the floor
    // If the bottom of the player + their downward velocity is LESS than the canvas height, keep increasing downward velocity
    if (this.position.y + this.height + this.velocity.y <= canvas.height) this.velocity.y += gravity
  }
}


class Platform {
  constructor({ x, y, image }) {
    this.position = {
      x: x, // Tip: If the property name is the same as the value you're assigning to it, you can just put the property name WITHOUT the colon and the value. I.e., "x: x" is the same as just simply putting "x"
      y: y
    }

    this.image = image
    this.width = image.width
    this.height = image.height

  }

  draw() {
    c.drawImage(this.image, this.position.x, this.position.y) // .drawImage() takes an image, an x position, and a y position
  }
}

// This is for scenery
class GenericObject {
  constructor({ x, y, image }) {
    this.position = {
      x: x, 
      y: y
    }

    this.image = image
    this.width = image.width
    this.height = image.height

  }

  draw() {
    c.drawImage(this.image, this.position.x, this.position.y) // .drawImage() takes an image, an x position, and a y position
  }
}

function createImage(imageSrc) {
  const image = new Image()
  image.src = imageSrc
  return image
}


// For the first initialization of the game, we use let instead of const because we need to be able to change the value of the variables once the game restarts upon death (except for keys)
// Ground platforms
let platformImage = platform

// Elevated platforms (should be rendered BEHIND the ground platforms, so they come first in the platforms array)
let platformSmallTallImage = platformSmallTall

let player = new Player()

// An array of platforms to be looped through
let platforms = []

let genericObjects = []


let lastKey

// This is specifically for movement on the x axis. Some people have computer settings such that when you PRESS AND HOLD a key, the input is only registered ONCE, which messes up the movement in this game. We'll used a "pressed" boolean to get around that.
const keys = {
  right: {
    pressed: false
  },
  left: {
    pressed: false
  }
}


// This tracks how far the platforms have scrolled across the screen. This is necessary for the WIN condition
let scrollOffset = 0

// INITIALIZING THE GAME AND RESTARTING THE GAME UPON DEATH
// init() will be called again whenever the player falls into a death pit
function init() {
  platformImage = platform
  player = new Player()

  // An array of platforms to be looped through
  platforms = [
    new Platform({
      x: platformImage.width * 4 + 300 - 2 + platformImage.width - platformSmallTallImage.width, 
      y: 270, 
      image: platformSmallTall
    }),
    new Platform({
      x: platformImage.width * 5 + 700 - 2 + platformImage.width, 
      y: 360, 
      image: platformSmallTall
    }),
    new Platform({
      x: -1, // Because this is the very first ground platform, use -1 instead of 0 to get rid of the tiny margin on the left side
      y: 470, // Ground platform level
      image: platformImage
    }), 
    new Platform({
      x: platformImage.width - 3, 
      y: 470, 
      image: platformImage
    }),
    new Platform({
      x: platformImage.width * 2 + 100, 
      y: 470, 
      image: platformImage
    }),
    new Platform({
      x: platformImage.width * 3 + 300, 
      y: 470, 
      image: platformImage
    }),
    new Platform({
      x: platformImage.width * 4 + 300 - 2, 
      y: 470, 
      image: platformImage
    }),
    new Platform({
      x: platformImage.width * 5 + 700 - 2, // We'll use the x position of the very last platform to determine where the game should end
      y: 470, 
      image: platformImage
    }),
    new Platform({
      x: platformImage.width * 6 + 700 - 4, 
      y: 470, 
      image: platformImage
    }),
    new Platform({
      x: platformImage.width * 7 + 700 - 2, 
      y: 367, 
      image: platformSmallTall
    }),
    new Platform({
      x: platformImage.width * 8 + 700 - 2, 
      y: 267, 
      image: platformSmallTall
    }),
    new Platform({
      x: platformImage.width * 9 + 700 - 2, 
      y: 167, 
      image: platformImage
    }),
    new Platform({
      x: platformImage.width * 9 + 1900, 
      y: 470, 
      image: platformImage
    })

  ]

  genericObjects = [
    // BACKGROUND
    new GenericObject({ 
      x: -1, // -1 instead of 0 to get rid of the margin
      y: -1, // -1 instead of 0 to get rid of the margin
      image: background
    }),
    // HILLS
    new GenericObject({ 
      x: -1, 
      y: -1, 
      image: hills
    })
  ]



  // This tracks how far the platforms have scrolled across the screen. This is necessary for the WIN condition
  scrollOffset = 0

}
// Animation Loop
function animate() { 
  requestAnimationFrame(animate)
  c.fillStyle = 'white'
  c.fillRect(0, 0, canvas.width, canvas.height) // Clears the canvas so that moving bodies don't smear across the screen
  
  genericObjects.forEach(genericObject => {
    genericObject.draw()
  })

  platforms.forEach(platform => {
    platform.draw()
  })
  player.update() // We draw the player AFTER the platforms are drawn so that the player is never hidden by them

  // RANGE OF HORIZONTAL MOVEMENT
  if (keys.right.pressed && player.position.x < 400) {
    player.velocity.x = player.speed
  } 
  else if (
    (keys.left.pressed && player.position.x > 100) ||
    // Allows the player to move to the left at the beginning of the level, but NOT beyond the left wall at the beginning of the game 
    (keys.left.pressed && scrollOffset === 0 && player.position.x > 0)
  ) {
    player.velocity.x = -player.speed
  } else {
    player.velocity.x = 0

    // Moves platforms to the RIGHT when the player moves FORWARD beyond their RIGHT HORIZONTAL LIMIT
    if (keys.right.pressed) {
      scrollOffset += player.speed

      platforms.forEach((platform) => {
      platform.position.x -= player.speed
      })

      // PARALLAX SCROLL FOR BACKGROUND AND HILLS
      genericObjects.forEach((genericObject) => {
        genericObject.position.x -= player.speed * 0.66 // 66% of the player speed
      }) 
    } 
    // Moves platforms to the RIGHT when the player moves BACKWARDS beyond their LEFT HORIZONTAL LIMIT until they reach the left wall at the beginning of the stage
    else if (keys.left.pressed && scrollOffset > 0) {
      scrollOffset -= player.speed

      platforms.forEach((platform) => {
      platform.position.x += player.speed
      })

      // PARALLAX SCROLL FOR BACKGROUND AND HILLS
      genericObjects.forEach((genericObject) => {
        genericObject.position.x += player.speed * 0.66
      })
    }
  }

  console.log(scrollOffset)


  // PLATFORM COLLISION DETECTION
  // Allowing the player to stand on platforms
  platforms.forEach((platform) => {
  if (player.position.y + player.height <= platform.position.y && 
    player.position.y + player.height + player.velocity.y >= platform.position.y &&
    player.position.x + player.width >= platform.position.x &&
    player.position.x <= platform.position.x + platform.width) {
    player.velocity.y = 0
    }
  })


  // SWITCHING BETWEEN SPRITES
  // Note: Don't switch between sprites in the event listener
  if (
    keys.right.pressed &&
    lastKey === 'right' && 
    player.currentSprite !== player.sprites.run.right) {
      player.frames = 1
      player.currentSprite = player.sprites.run.right
      player.currentCropWidth = player.sprites.run.cropWidth
      player.width = player.sprites.run.width
  } 
  else if (
    keys.left.pressed &&
    lastKey === 'left' && 
    player.currentSprite !== player.sprites.run.left) {
      player.currentSprite = player.sprites.run.left
      player.currentCropWidth = player.sprites.run.cropWidth
      player.width = player.sprites.run.width
  } 
  else if (
    !keys.left.pressed &&
    lastKey === 'left' && 
    player.currentSprite !== player.sprites.stand.left) {
      player.currentSprite = player.sprites.stand.left
      player.currentCropWidth = player.sprites.stand.cropWidth
      player.width = player.sprites.stand.width
  }
  else if (
    !keys.right.pressed &&
    lastKey === 'right' && 
    player.currentSprite !== player.sprites.stand.right) {
      player.currentSprite = player.sprites.stand.right
      player.currentCropWidth = player.sprites.stand.cropWidth
      player.width = player.sprites.stand.width
  }


  // WIN CONDITION
  if (scrollOffset > platformImage.width * 9 + 1900) {
    //platformImage.width * 5 + 700 - 2 is the x position of the very last platform
    // However, the platforms start scrolling when the player is at x:400, which means the endpoint is visually off by 400 pixels
    // Simply fix this by subtract 400 from 700
    // OR, you can set scrollOFfset to 400 to start. Either one works
    console.log("You win!")
  }

  // LOSE CONDITION
  if (player.position.y > canvas.height) {
    init() // This resets the player stats so the game restarts
  }
}

init()
animate()


// PLAYER MOVEMENT
window.addEventListener('keydown', ({ keyCode }) => { // We can use destructuring as a shortcut to get the keyCode property directly from the event

  switch (keyCode) {
    // A Key  
    case 65:
      console.log('left')
      keys.left.pressed = true
      lastKey = 'left'
      break

    // S Key  
    case 83:
      console.log('down')
      break

    // D Key  
    case 68:
      console.log('right')
      keys.right.pressed = true
      lastKey = 'right'
      break

    // W Key  
    case 87:
      console.log('up')
      player.velocity.y -= 10
      break
  }
})

window.addEventListener('keyup', ({ keyCode }) => { // We can use destructuring as a shortcut to get the keyCode property directly from the event

  switch (keyCode) {
    // A Key  
    case 65:
      console.log('left')
      keys.left.pressed = false
      break

    // S Key  
    case 83:
      console.log('down')
      break

    // D Key  
    case 68:
      console.log('right')
      keys.right.pressed = false
      
      break

    // W Key  
    case 87:
      console.log('up')
      break
  }
})



// npm start