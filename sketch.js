var db;
var pc = 0,gs = 0
var welcome;
var currentIndex = 0;
var car1,car2,cars = []
var allPlayers;

function preload(){
  car1Image = loadImage("images/car1.png")
  car2Image = loadImage("images/car2.png")
  trackImage = loadImage("images/track.jpg")
}

function setup(){
  db = firebase.database();
  
  createCanvas(1200,600);

  db.ref('GameState').on("value",function(data){
    gs = data.val()
  })

  db.ref('PlayerCount').on("value",function(data){
    pc = data.val()
  })
  
  input = createInput("Name")
  input.position(500,100)
  button = createButton("Play")
  button.position(500,200)
  button.mousePressed(enterPlayer)
  


  car1 = createSprite(200,590,30,30)
  car1.shapeColor = "green"
  car1.addImage(car1Image)
  car2 = createSprite(400,590,30,30)
  car2.shapeColor = "yellow"
  car2.addImage(car2Image)
  cars = [car1,car2]

  resetButton = createButton("Reset")
  resetButton.position(1000,100)
  resetButton.mousePressed(reset)
}

function draw(){
  background(180);
  
  //update gameState to 1 when 2 players are join
  if(pc===2 && gs===0){
    db.ref('/').update({GameState:1})
  }

  if(allPlayers===undefined && gs===1){
    db.ref("Players") .on ("value",function(data){
      allPlayers = data.val()
    })
  }

  //get the number of cars at the finish line 
  db.ref('CarsAtEnd').on("value", function(data){ pr = data.val(); })

   if(gs===1){
    var index = 0
    var x = 530
    background("white")
    image(trackImage,0,-height*2,width,height*3)
    for(var i in allPlayers){
      cars[index].x = x
      x = x + 200
      cars[index].y = allPlayers[i].y
     
      camera.position.x = width/2
      camera.position.y = cars[currentIndex-1].y -100

      if(index===currentIndex-1){
        fill("red")
        circle(cars[index].x,cars[currentIndex-1].y,60,60)
      }
      index++

    }
    if(keyDown(UP_ARROW)){
      cars[currentIndex -1].y = cars[currentIndex -1].y-10
      db.ref("Players/player" + currentIndex).update({
        y :cars[currentIndex -1] .y 
      })
    }

    //when car crosses end line
    if(cars[currentIndex-1].y<-1200){
      gs=2
      pr++
      db.ref('/').update({CarsAtEnd:pr})
      text("YOU WIN.YOUR RANK IS "+pr,width/2-100,cars[currentIndex-1].y-50)
    }
    drawSprites();
   }
   
  
}
function enterPlayer(){
  welcome = createElement('h2')
  welcome.position(300,200)
  var name = input.value()
  
  welcome.html("WELCOME " +name+ ". Please wait for others to join")
  input.hide()
  button.hide()
  //hide the greeting message after 2 seconds
   setTimeout(function(){welcome.hide()}, 2000);

  //increase playerCount by 1 and update database
  pc++
  db.ref('/').update({PlayerCount:pc})

  //updateing the players information in database
  db.ref('Players/player'+pc).set({PlayerName:name,
  index:pc,
  y:590})
  
  currentIndex = pc
}

function reset(){
  db.ref('/').update({
    GameState : 0,
    PlayerCount : 0,
    CarsAtEnd:0
  })
  db.ref('Players').remove()
}