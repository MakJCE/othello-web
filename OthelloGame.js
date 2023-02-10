import { AdversarialSearch } from './AdversarialSearch.js';

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

function range(start, end) {
  var res = [];
  while (start < end) {
    res.push(start);
    start += 1;
  }
  return res;
}

function all(lis) {
  return Boolean(lis.reduce((uno, dos) => uno && dos, true));
}

function sum(lis) {
  return lis.reduce((uno, dos) => uno + dos, 0);
}

var settings = {
  white_player: 0,
  black_player: 1
};

export class OthelloGame {
  constructor() {
    this.white_player = settings.white_player;
    this.black_player = settings.black_player;
    this.human_player = this.white_player;
    this.human_posible_moves = {};
    this.pc_moves_times = [];
    this.sum_pc_moves_states = 0;
    this.num_pc_moves = 0;
  }

  define_human_color(turn) {
    this.human_player = turn;

    if (this.human_player === this.white_player) {
      this.pc_move();
    }

    this.human_posible_moves = this.successors(this.human_player, this.state);
  }

  human_move(move) {
    this.state = this.make_move(
      this.state,
      this.human_posible_moves,
      move,
      this.human_player
    );
    this.pc_move();
    this.human_posible_moves = this.successors(this.human_player, this.state);

    while (Object.keys(this.human_posible_moves).length === 0) {
      if (!this.pc_move()) {
        break;
      }

      this.human_posible_moves = this.successors(this.human_player, this.state);
    }
  }

  show_state() {
    var posible_moves;
    posible_moves = Object.keys(this.human_posible_moves);
    return [this.state, posible_moves];
  }

  restart() {
    var bf;
    bf = this.calculate_bf(this.sum_pc_moves_states / this.num_pc_moves, 4);
    console.log(`The branching factor is: ${bf}`);
    this.state = [
      [
        [3, 3],
        [4, 4]
      ],
      [
        [3, 4],
        [4, 3]
      ]
    ];
    this.human_player = this.white_player;
    this.human_posible_moves = [];
    this.pc_moves_times = [];
    this.sum_pc_moves_states = 0;
    this.num_pc_moves = 0;
  }

  successors(turn, state) {
    var adversary,
      adversary_tokens_bettween,
      are_in_line,
      dict_successors,
      direction,
      direction_func,
      distance,
      in_limits,
      limit_to_one,
      next_step,
      player,
      steps_between,
      tokens_between;
    dict_successors = {};
    player =
      turn === this.black_player
        ? state[this.black_player]
        : state[this.white_player];
    adversary =
      turn !== this.black_player
        ? state[this.black_player]
        : state[this.white_player];

    limit_to_one = (num) => {
      return num === 0 ? 0 : num < 0 ? -1 : 1;
    };

    direction_func = (init_pos, end_pos) => {
      return [
        limit_to_one(init_pos[0] - end_pos[0]),
        limit_to_one(init_pos[1] - end_pos[1])
      ];
    };

    in_limits = (pos) => {
      return 0 <= pos[0] && pos[0] <= 7 && 0 <= pos[1] && pos[1] <= 7;
    };

    are_in_line = (pos1, pos2) => {
      return (
        pos1[0] === pos2[0] ||
        pos1[1] === pos2[1] ||
        pos1[0] - pos1[1] === pos2[0] - pos2[1] ||
        pos1[0] + pos1[1] === pos2[0] + pos2[1]
      );
    };

    distance = (p1, p2) => {
      return p1[0] !== p2[0]
        ? Math.abs(p1[0] - p2[0])
        : Math.abs(p1[1] - p2[1]);
    };

    tokens_between = (p1, direct, distance) => {
      return function () {
        var _pj_a = [],
          _pj_b = range(1, distance);

        for (var _pj_c = 0, _pj_d = _pj_b.length; _pj_c < _pj_d; _pj_c += 1) {
          var mult = _pj_b[_pj_c];

          _pj_a.push([p1[0] + direct[0] * mult, p1[1] + direct[1] * mult]);
        }

        return _pj_a;
      }.call(this);
    };

    adversary_tokens_bettween = (adversary, toks_between) => {
      return all(
        function () {
          var _pj_a = [],
            _pj_b = toks_between;

          for (var _pj_c = 0, _pj_d = _pj_b.length; _pj_c < _pj_d; _pj_c += 1) {
            var step = _pj_b[_pj_c];

            _pj_a.push(is_in(step, adversary));
          }

          return _pj_a;
        }.call(this)
      );
    };

    for (
      var token, _pj_c = 0, _pj_a = player, _pj_b = _pj_a.length;
      _pj_c < _pj_b;
      _pj_c += 1
    ) {
      token = _pj_a[_pj_c];

      for (
        var ad_token, _pj_f = 0, _pj_d = adversary, _pj_e = _pj_d.length;
        _pj_f < _pj_e;
        _pj_f += 1
      ) {
        ad_token = _pj_d[_pj_f];

        if (are_in_line(token, ad_token)) {
          direction = direction_func(ad_token, token);
          next_step = [ad_token[0] + direction[0], ad_token[1] + direction[1]];
          steps_between = tokens_between(
            token,
            direction,
            distance(token, next_step)
          );

          if (
            !is_in(next_step, player) &&
            !is_in(next_step, adversary) &&
            in_limits(next_step) &&
            adversary_tokens_bettween(adversary, steps_between)
          ) {
            if (Boolean(dict_successors[next_step])) {
              dict_successors[next_step] =
                dict_successors[next_step].concat(steps_between);
            } else {
              dict_successors[next_step] = steps_between;
            }
          }
        }
      }
    }

    return dict_successors;
  }

  pc_move() {
    var move, pc, posible_moves, search;
    search = new AdversarialSearch(this);
    pc =
      this.human_player === this.white_player
        ? this.black_player
        : this.white_player;
    posible_moves = this.successors(pc, this.state);

    if (Object.keys(posible_moves).length !== 0) {
      this.num_pc_moves += 1;
      let start_time = new Date();
      move = search.min_max_level_decision(pc, this.state);
      this.state = this.make_move(this.state, posible_moves, move, pc);
      let end_time = new Date();
      this.pc_moves_times.push(end_time - start_time);
      this.sum_pc_moves_states += search.num_states;
      return true;
    }

    return false;
  }

  make_move(state, dict_successors, move, turn) {
    if (!dict_successors[move]) console.log(move, dict_successors);
    var new_adversary, new_state, not_turn;
    not_turn =
      turn === this.white_player ? this.black_player : this.white_player;
    new_state = [[], []];
    new_state[turn] = state[turn].concat(dict_successors[move]);
    new_state[turn] = new_state[turn].concat([move]);
    new_adversary = [];

    for (
      var pos, _pj_c = 0, _pj_a = state[not_turn], _pj_b = _pj_a.length;
      _pj_c < _pj_b;
      _pj_c += 1
    ) {
      pos = _pj_a[_pj_c];

      if (!is_in(pos, dict_successors[move])) {
        new_adversary.push(pos);
      }
    }

    new_state[not_turn] = new_adversary;
    return new_state;
  }

  calculate_bf(num_states, goal_state_level) {
    var add_factor, b, func_result, funct, iterations;

    funct = (b) => {
      return sum(
        function () {
          var _pj_a = [],
            _pj_b = range(1, goal_state_level + 1);

          for (var _pj_c = 0, _pj_d = _pj_b.length; _pj_c < _pj_d; _pj_c += 1) {
            var exp = _pj_b[_pj_c];

            _pj_a.push(Math.pow(b, exp));
          }

          return _pj_a;
        }.call(this)
      );
    };

    add_factor = 1.0;
    b = 0.0;
    func_result = funct(b + add_factor);
    iterations = 1;

    while (num_states !== Number.parseInt(func_result) && iterations <= 1000) {
      if (func_result > num_states) {
        add_factor = add_factor * 0.1;
      }

      b += add_factor;
      func_result = funct(b + add_factor);
      iterations += 1;
    }

    return b + add_factor;
  }
}

_pj.set_properties(OthelloGame, {
  state: [
    [
      [3, 3],
      [4, 4]
    ],
    [
      [3, 4],
      [4, 3]
    ]
  ]
});
