// 1.33.55

window.addEventListener('load', function () {
  const canvas = document.getElementById('canvas1');
  const ctx = canvas.getContext('2d');
  canvas.width = 640;
  canvas.height = 360;

  ctx.fillStyle = 'white';
  ctx.lineWidth = 3;
  ctx.strokeStyle = 'white'

  class Player {
    constructor(game){
      this.game = game;
      this.collisionX = this.game.width * 0.5;
      this.collisionY = this.game.height * 0.5;
      this.collisionRadius = 15;
      this.speedX = 0;
      this.speedY = 0;
      this.dx = 0;
      this.dy = 0;
      this.speedModifier = 5;
      this.image = document.getElementById('bull')
      this.spriteWidth = 255;
      this.spriteHeight = 256;
      this.width = this.spriteWidth / 2;  
      this.height = this.spriteHeight / 2;
      this.spriteX;
      this.spriteY;
      this.frameX = 0;
      this.frameY = 0;
    }
    draw(context){
      context.drawImage(this.image, this.frameX * this.spriteWidth, this.frameY  * this.spriteHeight, this.spriteWidth, this.spriteHeight, this.spriteX, this.spriteY, this.width, this.height);
      if(this.game.debug){
        context.beginPath();
        context.arc(this.collisionX, this.collisionY, this.collisionRadius, 0, Math.PI * 2);
        context.save();
        context.globalAlpha = 0.5;
        context.fill();
        context.restore();
        context.stroke();
        context.beginPath();
        context.moveTo(this.collisionX, this.collisionY);
        context.lineTo(this.game.mouse.x, this.game.mouse.y)
        context.stroke();
      }
    }
    update(){
      this.dx = this.game.mouse.x - this.collisionX
      this.dy = this.game.mouse.y - this.collisionY

      // sprte anmatn
      const angle = Math.atan2(this.dy, this.dx);
      if(angle < -2.74 || angle > 2.74) this.frameY = 6;
      else if(angle < -1.96) this.frameY = 7;
      else if(angle < -1.17) this.frameY = 0;
      else if(angle < -0.39) this.frameY = 1;
      else if(angle < -0.39) this.frameY = 2;
      else if(angle < 1.17) this.frameY = 3;
      else if(angle < 1.96) this.frameY = 4;
      else if(angle < 2.74) this.frameY = 5;

      const distance = Math.hypot(this.dx, this.dy)
      if(distance > this.speedModifier){
        this.speedX = this.dx/distance || 0;
        this.speedY = this.dy/distance || 0;
      }else{
        this.speedX = 0;
        this.speedY = 0;
      }

      this.collisionX += this.speedX * this.
      speedModifier;
      this.collisionY += this.speedY * this.speedModifier;
      this.spriteX = this.collisionX - this.width / 2;
      this.spriteY = this.collisionY - this.height / 2 - 50;
      // limite hrzontal
      if(this.collisionX <this.collisionRadius) this.collisionX = this.collisionRadius
      else if(this.collisionX > this.game.width - this.collisionRadius) this.collisionX = this.game.width - this.collisionRadius
      // lmte vertcal
      if(this.collisionY < this.game.topMargin + this.collisionRadius) this.collisionY = this.game.topMargin + this.collisionRadius
      if(this.collisionY > this.game.height - this.collisionRadius) this.collisionY = this.game.height - this.collisionRadius
      this.game.obstacles.forEach( obstacle => {
        // [(distance < sumOfRadius), distance, sumOfRadius, dx, dy]
        let [collision, distance, sumOfRadius, dx, dy] = this.game.checkCollision(this, obstacle)
        if(collision){
          const unit_x = dx / distance;
          const unit_y = dy / distance;
          this.collisionX = obstacle.collisionX + (sumOfRadius + 1) * unit_x;
          this.collisionY = obstacle.collisionY + (sumOfRadius + 1) * unit_y;
        }
      })
    }
  }

  class Obstacle{
    constructor(game){
      this.game = game;
      this.collisionX = Math.random() * this.game.width;
      this.collisionY = Math.random() * this.game.height;
      this.collisionRadius = 20;
      this.image = document.getElementById('obstacles');
      this.spriteWidth = 250;
      this.spriteHeight = 250;
      this.width = this.spriteWidth / 2;
      this.height = this.spriteHeight / 2;
      this.spriteX = this.collisionX - this.width / 2;
      this.spriteY = this.collisionY - this.height / 2 - 35;
      this.frameX = Math.floor(Math.random()*4);
      this.frameY = Math.floor(Math.random()*3);
    }
    draw(context){
      context.drawImage(this.image, this.frameX * this.spriteWidth, this.frameY  * this.spriteHeight, this.spriteWidth, this.spriteHeight, this.spriteX, this.spriteY, this.width, this.height);
      if(this.game.debug){
        context.beginPath();
        context.arc(this.collisionX, this.collisionY, this.collisionRadius, 0, Math.PI * 2);
        context.save();
        context.globalAlpha = 0.5;
        context.fill();
        context.restore();
        context.stroke();
      }
    }
  }

  class Game {
    constructor(canvas){
      this.canvas = canvas;
      this.width = this.canvas.width;
      this.height = this.canvas.height;
      this.topMargin = 130;
      this.debug = false;
      this.player = new Player(this);
      this.fps = 40;
      this.timer = 0;
      this.interval = 1000/this.fps;
      this.numberOfObstacles = 10;
      this.obstacles = []
      this.mouse = {
        x : this.width * 0.5,
        y : this.height * 0.5,
        pressed: false
      }

      // listener
      // canvas.addEventListener('mousedown', function (event) {
      //   this.mouse.x = event.offsetX;
      //   this.mouse.y = event.offsetY;
      //   this.mouse.pressed = true;        
      // }.bind(this))

      canvas.addEventListener('mousedown', event => {
        this.mouse.x = event.offsetX;
        this.mouse.y = event.offsetY;
        this.mouse.pressed = false;        
      })

      canvas.addEventListener('mouseup', (event) => {
        this.mouse.x = event.offsetX;
        this.mouse.y = event.offsetY;
        this.mouse.pressed = false;        
      })

      canvas.addEventListener('mousemove', (event) => {
          if(this.mouse.pressed){
            this.mouse.x = event.offsetX;
            this.mouse.y = event.offsetY;
          }  
      })

      window.addEventListener('keydown', (event) => {
        if(event.key === 'd') this.debug = !this.debug;
      })

    }
    render(context, deltaTime){
      if(this.timer >this.interval){
        context.clearRect(0,0, this.width, this.height)
        this.obstacles.forEach( obstacle => {
          obstacle.draw(context);
        })
        this.player.update();
        this.player.draw(context);
        this.timer = 0;
      }
      this.timer += deltaTime;
      
    }
    checkCollision(a,b){
      const dx = a.collisionX - b.collisionX;
      const dy = a.collisionY - b.collisionY;
      const distance = Math.hypot(dy,dx);
      const sumOfRadius = a.collisionRadius + b.collisionRadius;
      return [(distance < sumOfRadius), distance, sumOfRadius, dx, dy];
    }
    init(){
      // for(let i = 0; i< this.numberOfObstacles ; i++){
      //   this.obstacles.push(new Obstacle(this))
      // }
      let attempts = 0;
      while(attempts < 10 && this.obstacles.length < this.numberOfObstacles){
        let testObstacle = new Obstacle(this);
        let overlap = false
        this.obstacles.forEach( obstacle => {
          const dx = testObstacle.collisionX - obstacle.collisionX;
          const dy = testObstacle.collisionY - obstacle.collisionY;
          const distance = Math.hypot(dy,dx);
          const distanceBuffer = 50;
          const sumOfRadius = testObstacle.collisionRadius + obstacle.collisionRadius + distanceBuffer;
          if(distance < sumOfRadius){
            overlap = true;
          };
        })
        const margin = testObstacle.collisionRadius * 3
        if(!overlap  && testObstacle.spriteX > 0 && testObstacle.spriteX < this.width - testObstacle.width && testObstacle.collisionY > this.topMargin + margin && testObstacle.collisionY < this.height - margin){
          this.obstacles.push(testObstacle)
        }
        attempts++;
      }
    }
  }

  const game = new Game(canvas);
  game.init();
  
  let lastTime = 0;
  
  function animate(timeStamp) {
    const deltaTime = timeStamp - lastTime;
    lastTime = timeStamp;
    console.log(deltaTime)
    game.render(ctx, deltaTime);
    window.requestAnimationFrame(animate)    
  }
  animate(0);
  
})
