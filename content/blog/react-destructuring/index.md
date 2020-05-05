---
title: Writing a one line React onChange function using destructuring
date: "2019-06-01T22:40:32.169Z"
type: "react"
---

First all we really need to know is what [destructuring](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment) is, without going into too much detail, you can "pick" values from objects or arrays and assign them to variables

For example `const [x, y] = [1,2]` will assign `1` to `x` and `2` to `y`.

You can also do this with objects, for example `const { age } = {age: 18}` will assign `18` to `age`.

---

#### Destructuring arguments in functions

You've probably written an `onChange` function in react to handle setting state for inputs before, something like:

```javascript
onChange = e => {
  this.setState({ [e.target.name]: e.target.value })
}
```

But we know we can destucture, so you might be tempted to then write:

```javascript
onChange = e => {
  const { name, value } = e.target
  this.setState({ [name]: value })
}
```

Which is okay, but still it can be way shorter. We can destructure the arguments directly instead:

```javascript
onChange = ({ target: { name, value } }) => this.setState({ [name]: value })
```

---

Another example:

```javascript
const getUserName = ({ user: { name } }) => name

getUserName({
  user: {
    name: "Jimmy",
    age: 18
  }
})
```

Here we simply destructure the name from the user and return it right away, it shows the `shape` of the arguments coming in, and it self-documents every part of it, you know you have to pass in an object with a `user` key, and it has to have a `name` inside that user. You don't need to read what the parameters being passed in are, because you can see it right in the function itself.
