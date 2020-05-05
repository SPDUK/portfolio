---
title: Elixir Snake Game
date: "2019-03-01T00:00:00.000Z"
featured: false
image: "./preview.jpg"
---

##### An OpenGL based snake game

[**Code on Github**](https://github.com/SPDUK/snake-elixir)

---

Tools Used: **[Elixir](https://elixir-lang.org/), [Scenic](https://github.com/boydm/scenic)**

---

![snake](https://raw.githubusercontent.com/SPDUK/snake-elixir/master/snake.gif)

#### What it does

Uses the [Scenic](https://github.com/boydm/scenic) GLFW driver to recreate the classic snake game, downloadable and playable on any machine.

#### How it works

The game window listens to user input for basic keyboard controls (up, down, left, right) to update the snake's position on the screen, the snake is just a list of tuples `[ {0, 0}, {0, 1}, {0, 2}, {1, 2}, {1, 1}, {0, 1} ]` that let us know the `x` and `y` positions of each part of the snake, We can therefore tell when a collision happens, because if any of the tuples are the same, the snake must be touching itself.

**Creating a pellet for the snake to eat**

Pellets are just randomly placed into a valid `x,y` coordinate, with a little check beforehand that recursively forces the pellet to spawn in a position that isn't part of the snake.

Here's what eating a pellet looks like in the code.

```elixir
  defp maybe_eat_pellet(state = %{objects: %{pellet: pellet_coords}}, snake_head_coords)
       when pellet_coords == snake_head_coords do
    state
    |> randomize_pellet()
    |> add_score(@pellet_score)
    |> grow_snake()
  end

```

You can tell what this code does without even knowing elixir, pipe the state through some functions, each one changing the state a little, then it returns the new state.

**Creating the score UI**

Making UI elements with scenic is rather simple, in this case we pass in a `score` that handles both the initial setup and updating of the score when a pellet gets ate by the snake.

```elixir
  defp draw_score(graph, score) do
    graph
    |> text("Score: #{score}", fill: :white, translate: {@tile_size, @tile_size})
  end
```

That's all there really is to a snake game, you can move, game over, eat pellets, and the score goes up.

Feel free to clone the project on GitHub](https://github.com/SPDUK/snake-elixir) and give it a try.
