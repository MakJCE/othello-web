var _pj;

function _pj_snippets(container) {
  function in_es6(left, right) {
    if (right instanceof Array || typeof right === 'string') {
      return right.indexOf(left) > -1;
    } else {
      if (
        right instanceof Map ||
        right instanceof Set ||
        right instanceof WeakMap ||
        right instanceof WeakSet
      ) {
        return right.has(left);
      } else {
        return left in right;
      }
    }
  }

  function set_properties(cls, props) {
    var desc, value;
    var _pj_a = props;

    for (var p in _pj_a) {
      if (_pj_a.hasOwnProperty(p)) {
        value = props[p];

        if (
          !(value instanceof Map || value instanceof WeakMap) &&
          value instanceof Object &&
          'get' in value &&
          value.get instanceof Function
        ) {
          desc = value;
        } else {
          desc = {
            value: value,
            enumerable: false,
            configurable: true,
            writable: true
          };
        }

        Object.defineProperty(cls.prototype, p, desc);
      }
    }
  }

  container['in_es6'] = in_es6;
  container['set_properties'] = set_properties;
  return container;
}

_pj = {};

_pj_snippets(_pj);

function is_in(el, lis) {
  return lis.reduce(
    (uno, dos) => uno || JSON.stringify(dos) === JSON.stringify(el),
    false
  );
}
function max(l1, l2) {
  return l1[0] >= l2[0] ? l1 : l2;
}
function min(l1, l2) {
  return l1[0] <= l2[0] ? l1 : l2;
}
function sum(lis) {
  return lis.reduce((uno, dos) => uno + dos, 0);
}

var settings = {
  white_player: 0,
  black_player: 1
};

export class AdversarialSearch {
  constructor(game, alpha_beta = true) {
    this.white_player = settings.white_player;
    this.black_player = settings.black_player;
    this.game = game;
    this.inf = 100;
    this.neg_inf = -100;
    this.num_states = 0;
    this.aplha_beta_active = alpha_beta;
    this.initial_state = [[], []];
  }

  evalu(state) {
    var count_blacks, count_whites, value_player_per_pos, value_pos;

    value_pos = (pos) => {
      return (pos[0] === this.board_size - 1 || pos[0] === 0) &&
        (pos[1] === this.board_size - 1 || pos[1] === 0)
        ? 6
        : pos[0] === this.board_size - 1 ||
          pos[0] === 0 ||
          pos[1] === this.board_size - 1 ||
          pos[1] === 0
        ? 2
        : pos[0] === this.board_size - 3 ||
          pos[0] === 2 ||
          pos[1] === this.board_size - 3 ||
          pos[1] === 2
        ? 1
        : pos[0] === this.board_size - 2 ||
          pos[0] === 1 ||
          pos[1] === this.board_size - 2 ||
          pos[1] === 1
        ? -1
        : 0;
    };

    value_player_per_pos = (positions, turn) => {
      return sum(
        function () {
          var _pj_a = [],
            _pj_b = positions;

          for (var _pj_c = 0, _pj_d = _pj_b.length; _pj_c < _pj_d; _pj_c += 1) {
            var pos = _pj_b[_pj_c];

            if (!is_in(pos, this.initial_state[turn])) {
              _pj_a.push(value_pos(pos));
            }
          }

          return _pj_a;
        }.call(this)
      );
    };

    count_blacks = value_player_per_pos(
      state[this.black_player],
      this.black_player
    );
    count_whites = value_player_per_pos(
      state[this.white_player],
      this.white_player
    );

    if (count_blacks > count_whites) {
      return count_blacks;
    } else if (count_whites > count_blacks) {
      return count_whites * -1;
    } else {
      return 0;
    }
  }

  cut_off(successors, depth) {
    var max_depth;
    max_depth = 4;
    return Object.keys(successors).length === 0 || depth >= max_depth;
  }

  min_max_level_decision(turn, state) {
    var last_move;
    this.initial_state = state;
    last_move = [0, 0];
    if (turn === this.black_player) {
      last_move = state[this.black_player][0];
      return this.max_value(state, last_move, this.neg_inf, this.inf, 0)[1];
    }

    if (turn === this.white_player) {
      last_move = state[this.white_player][0];
      return this.min_value(state, last_move, this.neg_inf, this.inf, 0)[1];
    }
  }

  min_value(state, move, alpha, beta, depth) {
    var successors_white, value;
    this.num_states += 1;
    successors_white = this.game.successors(this.white_player, state);

    if (this.cut_off(successors_white, depth)) {
      return [this.evalu(state), move];
    } else {
      value = this.inf;
      for (
        var successor,
          _pj_c = 0,
          _pj_a = Object.keys(successors_white),
          _pj_b = _pj_a.length;
        _pj_c < _pj_b;
        _pj_c += 1
      ) {
        successor = JSON.parse('[' + _pj_a[_pj_c] + ']');
        [value, move] = min(
          [value, move],
          [
            this.max_value(
              this.game.make_move(
                state,
                successors_white,
                successor,
                this.white_player
              ),
              successor,
              alpha,
              beta,
              depth + 1
            )[0],
            successor
          ]
        );

        if (value <= alpha && this.aplha_beta_active) {
          return [value, move];
        }

        beta = value < beta ? value : beta;
      }
    }

    return [value, move];
  }

  max_value(state, move, alpha, beta, depth) {
    var successors_black, value;
    this.num_states += 1;
    successors_black = this.game.successors(this.black_player, state);

    if (this.cut_off(successors_black, depth)) {
      return [this.evalu(state), move];
    } else {
      value = this.neg_inf;
      for (
        var successor,
          _pj_c = 0,
          _pj_a = Object.keys(successors_black),
          _pj_b = _pj_a.length;
        _pj_c < _pj_b;
        _pj_c += 1
      ) {
        successor = JSON.parse('[' + _pj_a[_pj_c] + ']');
        [value, move] = max(
          [value, move],
          [
            this.min_value(
              this.game.make_move(
                state,
                successors_black,
                successor,
                this.black_player
              ),
              successor,
              alpha,
              beta,
              depth + 1
            )[0],
            successor
          ]
        );

        if (value >= beta && this.aplha_beta_active) {
          return [value, move];
        }

        alpha = value > alpha ? value : alpha;
      }
    }

    return [value, move];
  }
}

_pj.set_properties(AdversarialSearch, {
  board_size: 8
});
