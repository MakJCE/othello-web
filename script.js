import { OthelloGame } from './OthelloGame.js';

const BLACK_PIECE_HTML = '<img src="assets/black_piece_reversi.png" class="game-piece" alt="Black Piece">';
const WHITE_PIECE_HTML = '<img src="assets/white_piece_reversi.png" class="game-piece" alt="White Piece">';

var game;
window.addEventListener('load', (event) => {
  var boxes = document.querySelectorAll('i');
  var selected_box;
  var actual_posible_moves;
  var lastMoveId = 0;
  var pc_moves_times;
  var loader = document.querySelector('.container-loader');
  function init(human_player) {
    sessionStorage.setItem('human_player', human_player);
    return { message: 'done' };
  }
  function get_board() {
    var [state, posible_moves] = game.show_state();
    return {
      payload: [state[game.black_player], state[game.white_player]],
      moves: posible_moves.map((move) => JSON.parse('[' + move + ']')),
      turn: game.human_player,
      response_time: game.pc_moves_times
    };
  }
  function human_move(move) {
    game.human_move(move);
    return { message: 'done' };
  }
  function restart_game() {
    game.restart();
    return { message: 'done' };
  }
  function initializeBoxes() {
    var iter = 1;
    for (let box of boxes) {
      box.id = iter.toString();
      box.addEventListener('click', errorMessage);
      iter += 1;
    }
  }
  initializeBoxes();
  function showPcLastMove(human_turn, p1, p2) {
    boxes[lastMoveId].style.borderColor = 'rgb(221, 218, 218)';
    var pos;
    if (human_turn == 0) {
      pos = p1[p1.length - 1];
      lastMoveId = pos[0] * 8 + pos[1];
      boxes[lastMoveId].style.borderColor = '#72c2ff';
    } else {
      pos = p2[p2.length - 1];
      lastMoveId = pos[0] * 8 + pos[1];
      boxes[lastMoveId].style.borderColor = '#72c2ff';
    }
  }
  function selectBox(event) {
    loader.style.zIndex = 10;
    var id = event.currentTarget.id;
    event.preventDefault();
    selected_box = [Math.floor((id - 1) / 8), Math.floor((id - 1) % 8)];
    removeTurnStyles();
    postMove()
      .then(() => {
        show_board();
      })
      .finally(() => {
        loader.style.zIndex = 0;
      });
  }
  function removeTurnStyles() {
    document.getElementById('error').innerHTML = '';
    for (var i of actual_posible_moves) {
      var to_id = i[0] * 8 + i[1];
      boxes[to_id].innerHTML = '';
      boxes[to_id].style.opacity = '';
      boxes[to_id].removeEventListener('click', selectBox);
    }
  }
  function errorMessage() {
    document.getElementById('error').innerHTML = 'Invalid Move';
  }
  function postMove() {
    return new Promise(function (resolve, reject) {
      var data = {
        move: selected_box
      };
      try {
        var response = human_move(data.move);
        if (response) {
          resolve();
        }
      } catch (error) {
        console.error(error);
        reject();
      }
    });
  }
  function restartGame(event) {
    var response = restart_game();
    try {
      if (response) {
        window.location.href = 'index.html';
        sessionStorage.removeItem('human_player');
        sessionStorage.removeItem('game_params');
      }
    } catch (error) {
      console.error(error);
    }
  }
  function endGame(human_turn, count_black, count_white) {
    var avg_pc_moves_times =
      pc_moves_times.reduce((a, b) => a + b, 0) / 1000 / pc_moves_times.length;
    const winner_messages = {
      human: '🎉You win!!!🎉',
      pc: 'You lose! 😭',
      tie: 'Tie! 👀'
    }
    if (count_black > count_white) {
      alert(
        `Game ended.\n${human_turn == 1? winner_messages.human: winner_messages.pc}\nThe winner is Black\nwith ${count_black} tokens against ${count_white}\nThe bot average response time is ${avg_pc_moves_times} segs`
      );
    } else if (count_white > count_black) {
      alert(
        `Game ended.\n${human_turn == 0? winner_messages.human: winner_messages.pc}\nThe winner is White\nwith ${count_white} tokens against ${count_black}\nThe bot average response time is ${avg_pc_moves_times} segs`
      );
    } else {
      alert(
        `Game ended.\n${ winner_messages.tie}\nThe game result is tie.\nBoth player has ${count_black} tokens.\nThe bot average response time is ${avg_pc_moves_times} segs`
      );
    }
    pc_moves_times = [];
    sessionStorage.removeItem('human_player');
    sessionStorage.removeItem('game_params');
    restartGame(null);
  }
  function verifyGameState() {
    if (!!sessionStorage.getItem('human_player')) {
      if (!game) {
        var instance_game = new OthelloGame();
        instance_game.define_human_color(
          parseInt(sessionStorage.getItem('human_player'))
        );
        game = instance_game;
        if (!!sessionStorage.getItem('game_params')) {
          var params = JSON.parse(sessionStorage.getItem('game_params'));
          game.state = params.state;
          game.human_posible_moves = params.human_posible_moves;
          game.pc_moves_times = params.pc_moves_times;
          game.sum_pc_moves_states = params.sum_pc_moves_states;
          game.num_pc_moves = params.num_pc_moves;
        }
      } else {
        sessionStorage.setItem(
          'game_params',
          JSON.stringify({
            state: game.state,
            human_posible_moves: game.human_posible_moves,
            pc_moves_times: game.pc_moves_times,
            sum_pc_moves_states: game.sum_pc_moves_states,
            num_pc_moves: game.num_pc_moves
          })
        );
      }
    } else {
      window.location.href = 'index.html';
    }
  }
  function show_board() {
    if (!!document.getElementById('black-counter')) {
      verifyGameState();
      var message = get_board();
      try {
        if (message) {
          var player_1 = message.payload[0];
          var player_2 = message.payload[1];
          var aux =
            message.response_time.length > 0
              ? message.response_time[message.response_time.length - 1]
              : 0;
          document.getElementById(
            'black-counter'
          ).innerHTML = `${player_1.length} `;
          document.getElementById(
            'white-counter'
          ).innerHTML = `${player_2.length} `;
          document.getElementById('pc_response_time').innerHTML =
            'PC time response: ' + `${aux / 1000}`.substring(0, 5) + 'segs';
          pc_moves_times = message.response_time;
          var to_id;

          for (var i of player_1) {
            to_id = i[0] * 8 + i[1];
            boxes[to_id].innerHTML = BLACK_PIECE_HTML;
          }
          for (var i of player_2) {
            to_id = i[0] * 8 + i[1];
            boxes[to_id].innerHTML = WHITE_PIECE_HTML;
          }
          if (message.moves.length == 0) {
            endGame(message.turn, player_1.length, player_2.length);
          }
          actual_posible_moves = message.moves;
          for (var i of actual_posible_moves) {
            to_id = i[0] * 8 + i[1];
            boxes[to_id].addEventListener('click', selectBox);
            boxes[to_id].innerHTML = message.turn === game.white_player ? WHITE_PIECE_HTML : BLACK_PIECE_HTML;
            boxes[to_id].style.opacity = '0.2';
          }
          var human_turn = message.turn;
          pc_moves_times.length &&
            showPcLastMove(human_turn, player_1, player_2);
        }
      } catch (error) {
        console.error(error);
      }
    }
  }
  show_board();
  function select_color(event, color) {
    var data = {
      turn: color == 'black' ? 1 : 0
    };
    try {
      var response = init(data.turn);
      show_board();
    } catch (error) {
      console.error(error);
    }
  }
  function select_white(event) {
    select_color(event, 'white');
    window.location.href = 'game.html';
  }
  function select_black(event) {
    select_color(event, 'black');
    window.location.href = 'game.html';
  }
  document
    .getElementById('white-button')
    ?.addEventListener('click', select_white);
  document
    .getElementById('black-button')
    ?.addEventListener('click', select_black);
  document
    .getElementById('restart-button')
    ?.addEventListener('click', restartGame);
  //document.getElementById('move').addEventListener('submit',post_move);
});
