/**
 * [Main Self Executing function]
 * @param  {[DOMElement]} [doc] [this is the "document" global element]
 * @return {[void]}        [function has no return value]
 */
(doc => {
  let state = {};

  /**
   * [stateInitializer the main state of the function]
   * @return {[Object]} [the state object ]
   */
  const stateInitializer = () => {
    return {
      activePlayer: undefined,
      cpu: false,
      boxesChecked: 0,
      gameFinished: false,
      players: {
        player1: {
          name: "",
          id: "player1",
          icon: "url(img/o.svg)",
          checked: []
        },
        player2: {
          name: "",
          id: "player2",
          icon: "url(img/x.svg)",
          checked: []
        }
      },
      winningCombos: [
        [0, 1, 2],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [3, 4, 5],
        [6, 7, 8],
        [0, 4, 8],
        [2, 4, 6]
      ],
      boxes: [
        {
          id: 0,
          occupiedBy: ""
        },
        {
          id: 1,
          occupiedBy: ""
        },
        {
          id: 2,
          occupiedBy: ""
        },
        {
          id: 3,
          occupiedBy: ""
        },
        {
          id: 4,
          occupiedBy: ""
        },
        {
          id: 5,
          occupiedBy: ""
        },
        {
          id: 6,
          occupiedBy: ""
        },
        {
          id: 7,
          occupiedBy: ""
        },
        {
          id: 8,
          occupiedBy: ""
        }
      ]
    };
  };

  /**
   * [checkIfPlayerIsTheCPU function checks if the current player is the CPU]
   * @return {[boolean]} [returns true if the player is the CPU]
   */
  const checkIfPlayerIsTheCPU = () =>
    state.players[state.activePlayer].name === "Computer" && state.cpu;

  /**
   * [cpuClicker function triggers a click event on the ]
   * @param  {[number]} boxId [the id of the box to be clicked]
   * @return {[void]}       [no return]
   */
  const cpuClicker = boxId => doc.getElementById(boxId).click();

  /**
   * [chooseBoxAndClick function randomly chooses which box to click in if it's empty]
   * @return {[void]} [no return]
   */
  const chooseBoxAndClick = () => {
    let emptyBoxNotFound = true;

    while (emptyBoxNotFound) {
      const boxId = Math.floor(Math.random() * 9);
      if (state.boxes[boxId].occupiedBy === "") {
        cpuClicker(boxId);
        emptyBoxNotFound = false;
      }
    }
  };

  /**
   * [eventBinder this function binds events to the input elements]
   * @param  {[DOMElement]} elementToBindTo [which element should be bound with an event]
   * @param  {[DOMEvent]} eventName       [event type to be bound]
   * @param  {[function]} eventResolver   [the function that will take care of the event trigger]
   * @return {[void]}                 [no return]
   */
  const eventBinder = (elementToBindTo, eventName, eventResolver) =>
    elementToBindTo.addEventListener(eventName, eventResolver);

  /**
   * [startButtonListener function binds the start button with the click listener]
   * @return {[function]} [returns the event binding function]
   */
  const startButtonListener = () =>
    eventBinder(
      doc.getElementById("start-button"),
      "click",
      startButtonResolver
    );

  /**
   * [cpuListener function binds the start button with the click listener]
   * @return {[function]} [returns the event binding function]
   */
  const cpuListener = () =>
    eventBinder(
      doc.getElementById("cpu-checkbox"),
      "change",
      cpuCheckboxResolver
    );

  /**
   * [startNewGameListener function listens when the start new game button is clicked]
   * @return {[function]} [binding a click listener to the start new game button]
   */
  const startNewGameListener = () =>
    eventBinder(doc.getElementsByClassName("button")[0], "click", startNewGame);

  /**
   * [mainMenuListener function listens when the main menu button is clicked]
   * @return {[function]} [binding a click listener to the main menu button]
   */
  const mainMenuListener = () =>
    eventBinder(doc.getElementsByClassName("button")[1], "click", goToMainMenu);

  /**
   * [endPageBuilder this function "builds" / injects the end page html into the DOM]
   * @param  {[string]} playerName [this is the player name which won the game]
   * @param  {[string]} endStyle   [this is the background CSS class to indicate player specific win page]
   * @return {[void]}            [no return value]
   */
  const endPageBuilder = (playerName, endStyle) => {
    state.gameFinished = true;
    doc.body.innerHTML = injectEndPage(playerName, endStyle);
    startNewGameListener();
    mainMenuListener();
  };

  /**
   * [mouseOverListener function binds the mouseOver event listener to the play boxes]
   * @return {[function]} [returns the binding function]
   */
  const mouseOverListener = () =>
    eventBinder(
      doc.getElementsByClassName("boxes")[0],
      "mouseover",
      mouseOverResolver
    );

  /**
   * [mouseOverResolver function that gets called to determine to see if a box
   * is taken and show the right mouseOver image for the current player]
   * @param  {[DOMElement]} event [which box was hovered over]
   * @return {[void]}       [no return value]
   */
  const mouseOverResolver = event => {
    if (!boxOccupied(event.target.id)) {
      event.target.style.backgroundImage =
        state.players[state.activePlayer].icon;
    } else {
      event.target.style.cursor = "not-allowed";
    }
  };

  /**
   * [mouseOutListener function trigerres when the mouse triggers the mouseout
   * event on the boxes]
   * @return {[function]} [this return the function resolver for the mouseout]
   */
  const mouseOutListener = () =>
    eventBinder(
      doc.getElementsByClassName("boxes")[0],
      "mouseout",
      mouseOutResolver
    );

  /**
   * [mouseOutResolver function removes the background image from the box]
   * @param  {[DOMEvent]} event [on which box the event was triggered]
   * @return {[void]}       [no return time]
   */
  const mouseOutResolver = event => {
    event.target.style.backgroundImage = "";
  };

  /**
   * [boxClickListener function binds a click listener to all the boxes]
   * @return {[function]} [click resolver for the click listener]
   */
  const boxClickListener = () =>
    eventBinder(
      doc.getElementsByClassName("boxes")[0],
      "click",
      boxClickResolver
    );

  /**
   * [boxClickResolver function resolves the click event on the boxes -
   * providing the right image for it and sets the box state to show who
   * selected this box]
   * @param  {[DOMEvent]} event [which box triggered the click event]
   * @return {[void]}       [no return value]
   */
  const boxClickResolver = event => {
    if (state.boxes[event.target.id].occupiedBy === "") {
      state.players[state.activePlayer].checked.push(
        parseInt(event.target.id, 10)
      );

      state.boxesChecked++;

      if (state.activePlayer === "player1") {
        event.target.classList.add("box-filled-1");
      } else {
        event.target.classList.add("box-filled-2");
      }

      boxStateUpdater(event.target.id, state.activePlayer);

      if (state.boxesChecked >= 5 && state.boxesChecked < 9) {
        if (
          gameStateChecker(
            state.activePlayer,
            state.players[state.activePlayer].checked
          )
        ) {
          // inject the end page with the winners data
          if (state.activePlayer === "player1") {
            endPageBuilder(
              state.players[state.activePlayer].name,
              "screen-win-one"
            );
          } else {
            endPageBuilder(
              state.players[state.activePlayer].name,
              "screen-win-two"
            );
          }
        }
      } else if (state.boxesChecked === 9) {
        if (
          gameStateChecker(
            state.activePlayer,
            state.players[state.activePlayer].checked
          )
        ) {
          // inject the end page with the winners data
          if (state.activePlayer === "player1") {
            endPageBuilder(
              state.players[state.activePlayer].name,
              "screen-win-one"
            );
          } else {
            endPageBuilder(
              state.players[state.activePlayer].name,
              "screen-win-two"
            );
          }
        } else {
          endPageBuilder("It's a tie", "screen-win-tie");
        }
      }
      if (!state.gameFinished) {
        playerSwitcher(state.activePlayer);
      }
    } else {
      event.preventDefault();
    }
  };

  /**
   * [playerSwitcher function is responsible for player switching]
   * @param  {[string]} player [this is the player id]
   * @return {[void]}        [no return value]
   */
  const playerSwitcher = player => {
    const playerElement = doc.getElementById(player);

    playerElement.classList.remove("active");

    if (player === "player1") {
      state.activePlayer = "player2";
    } else {
      state.activePlayer = "player1";
    }

    if (playerElement.previousElementSibling) {
      playerElement.previousElementSibling.classList.add("active");
    } else {
      playerElement.nextElementSibling.classList.add("active");
    }

    if (state.players[state.activePlayer].name === "Computer" && state.cpu) {
      setTimeout(() => {
        chooseBoxAndClick();
      }, 1000);
    }
  };

  /**
   * [boxStateUpdater function updates the state with the parameter data to be
   * set to a box on the board - who clicked it]
   * @param  {[string]} boxId  [the box id which was clicked]
   * @param  {[string]} player [the player id that clicked this box]
   * @return {[void]}        [no return value - state is globally updated]
   */
  const boxStateUpdater = (boxId, player) => {
    state.boxes[boxId].occupiedBy = player;
  };

  /**
   * [boxOccupied function checks if the box has been already clicked]
   * @param  {[string]} boxId [box id which was clicked]
   * @return {[boolean]}       [return true if the box is not occupied else false]
   */
  const boxOccupied = boxId => state.boxes[boxId].occupiedBy !== "";

  /**
   * [cpuCheckboxResolver function resolves the click / change event on the CPU
   * checkbox - if the CPU play was selected]
   * @param  {[DOMEvent]} event [event triggered on checkbox change]
   * @return {[type]}       [description]
   */
  const cpuCheckboxResolver = event => {
    if (event.target.checked) {
      doc.getElementById("player-two-container").style.visibility = "hidden";
      state.cpu = true;
    } else {
      doc.getElementById("player-two-container").style.visibility = "initial";
      state.cpu = false;
    }
  };

  /**
   * [startButtonResolver function checks the input data for the players and
   * injects the game start page template into the DOM]
   * @param  {[DOMEvent]} event [the click event from the start game button]
   * @return {[void]}       [no return value]
   */
  const startButtonResolver = event => {
    event.preventDefault();

    const playerOneValue = doc.getElementById("player-one").value;
    const playerTwoValue = doc.getElementById("player-two").value;

    state.players.player1.name = playerOneValue;
    state.players.player2.name = playerTwoValue;

    doc.body.innerHTML = injectGamePage(playerOneValue, playerTwoValue);

    buildGamePage(playerOneValue, playerTwoValue);
  };

  /**
   * [injectStartPage function injects the start page HTML into the DOM Body]
   * @return {[string]} [the HTML template for the start page]
   */
  const injectStartPage = () => {
    return `<div class="screen screen-start" id="start">
            <header>
                <h1>Tic Tac Toe</h1>
                <section id="cpu-selector" style="margin-top: 20px;">
                    <label for="cpu-checkbox" style="display: block;">Select to play against CPU</label>
                    <input type="checkbox" id="cpu-checkbox">
                </section>
                <section id="player-one-container" style="margin: 10px 0;">
                    <label for="player-one" style="display: block; margin-bottom: 5px;">Player 1</label>
                    <input id="player-one" name="player-one">
                </section>
                <section id="player-two-container" style="margin: 10px 0;">
                    <label for="player-two" style="display: block; margin-bottom: 5px;">Player 2</label>
                    <input id="player-two" name="player-two">
                </section>
                <section id="start-button" style="margin-top: 20px;"><a href="#" class="button">Start game</a></section>
            </header>
        </div>`;
  };

  /**
   * [injectGamePage function injects the game page template into the DOM Body]
   * @param  {[string]} playerOne [name of player 1]
   * @param  {[string]} playerTwo [name of player 2]
   * @return {[string]}           [returns the template string with injected
   * names for player1 and player2]
   */
  const injectGamePage = (playerOne, playerTwo) => {
    const secondPlayer = state.cpu ? "Computer" : playerTwo;
    state.players.player2.name = secondPlayer;

    return `<div class="board" id="board">
        <header>
            <h1>Tic Tac Toe</h1>
            <ul>
              <li class="players " id="player1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="42" height="42" viewBox="0 0 42 42" version="1.1"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-200.000000, -60.000000)" fill="#000000"><g transform="translate(200.000000, 60.000000)"><path d="M21 36.6L21 36.6C29.6 36.6 36.6 29.6 36.6 21 36.6 12.4 29.6 5.4 21 5.4 12.4 5.4 5.4 12.4 5.4 21 5.4 29.6 12.4 36.6 21 36.6L21 36.6ZM21 42L21 42C9.4 42 0 32.6 0 21 0 9.4 9.4 0 21 0 32.6 0 42 9.4 42 21 42 32.6 32.6 42 21 42L21 42Z"/></g></g></g></svg>
                  <p style="padding: 0; margin: 0; color: black;">${playerOne}</p>
              </li>
              <li class="players" id="player2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="42" height="43" viewBox="0 0 42 43" version="1.1"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-718.000000, -60.000000)" fill="#000000"><g transform="translate(739.500000, 81.500000) rotate(-45.000000) translate(-739.500000, -81.500000) translate(712.000000, 54.000000)"><path d="M30 30.1L30 52.5C30 53.6 29.1 54.5 28 54.5L25.5 54.5C24.4 54.5 23.5 53.6 23.5 52.5L23.5 30.1 2 30.1C0.9 30.1 0 29.2 0 28.1L0 25.6C0 24.5 0.9 23.6 2 23.6L23.5 23.6 23.5 2.1C23.5 1 24.4 0.1 25.5 0.1L28 0.1C29.1 0.1 30 1 30 2.1L30 23.6 52.4 23.6C53.5 23.6 54.4 24.5 54.4 25.6L54.4 28.1C54.4 29.2 53.5 30.1 52.4 30.1L30 30.1Z"/></g></g></g></svg>
                  <p style="padding: 0; margin: 0; color: black;">${secondPlayer}</p>
              </li>
            </ul>
          </header>
          <ul class="boxes">
            <li class="box" id="0"></li>
            <li class="box" id="1"></li>
            <li class="box" id="2"></li>
            <li class="box" id="3"></li>
            <li class="box" id="4"></li>
            <li class="box" id="5"></li>
            <li class="box" id="6"></li>
            <li class="box" id="7"></li>
            <li class="box" id="8"></li>
          </ul>
    </div>`;
  };

  /**
   * [startNewGame function resets the state and rebuilds the game page]
   * @return {[void]} [no return value]
   */
  const startNewGame = () => {
    const cpuState = state.cpu;
    const player1 = state.players.player1.name;
    const player2 = state.players.player2.name;
    state = stateInitializer();
    state.cpu = cpuState;
    state.players.player1.name = player1;
    state.players.player2.name = player2;
    doc.body.innerHTML = injectGamePage(player1, player2);
    buildGamePage();
  };

  /**
   * [goToMainMenu resets the state to empty object and inject the main page]
   * @return {[void]} [no return value]
   */
  const goToMainMenu = () => {
    state = {};
    doc.body.innerHTML = injectStartPage();
    startButtonListener();
    cpuListener();
  };

  /**
   * [injectEndPage function injects the end page of the game - the winner and
   * the end game background based on who won]
   * @param  {[string]} winner    [the player name that won the game]
   * @param  {[string]} gameState [the class of the game state win/draw]
   * @return {[string]}           [returns the end game template string]
   */
  const injectEndPage = (winner, gameState) => {
    return `<div class="screen screen-win ${gameState}" id="finish">
            <header>
              <h1>Tic Tac Toe</h1>
              <p class="message">${winner}</p>
              <a href="#" class="button">New game</a>
              <a href="#" class="button">Main menu</a>
            </header>
          </div>`;
  };

  /**
   * [gameStateChecker function checks the state of the game and decides if the
   * game is finished or not]
   * @param  {[string]} activePlayer       [checks the state of active players
   * board state]
   * @param  {[array]} playerCheckedArray [array of players checked boxes]
   * @return {[boolean]}                    [returns if the player has won]
   */
  const gameStateChecker = (activePlayer, playerCheckedArray) => {
    let hasWon = false;
    state.winningCombos.map(winningArray => {
      let matchCounter = 0;
      winningArray.map(winningValue => {
        playerCheckedArray.map(playerValue => {
          if (winningValue === playerValue) {
            matchCounter++;
          }
        });
      });
      if (matchCounter === 3) {
        hasWon = true;
      }
    });

    return hasWon;
  };

  /**
   * [buildGamePage function builds the game page with the template and the
   * listeners for the DOM]
   * @return {[void]} [no return value]
   */
  const buildGamePage = () => {
    if (Math.floor(Math.random() * Math.floor(2)) === 1) {
      state.activePlayer = "player1";
    } else {
      state.activePlayer = "player2";
    }

    doc.getElementById(state.activePlayer).classList.add("active");

    mouseOverListener();
    mouseOutListener();

    // listening to the click event on one of the boxes
    boxClickListener();

    if (state.cpu) {
      if (checkIfPlayerIsTheCPU()) {
        setTimeout(() => {
          chooseBoxAndClick();
        }, 1000);
      }
    }
  };

  /**
   * [main the main starting function]
   * @return {[void]} [no return value]
   */
  const main = () => {
    state = stateInitializer();
    doc.body.innerHTML = injectStartPage();
    startButtonListener();
    cpuListener();
  };

  main();
})(document);
