---
title: JavaScript 101 - Variables & Primitives
date: 2021-01-10T12:16:48.209Z
type: javascript
action: code
---




### What you'll learn

- Variables
- Memory in JavaScript 
- Execution context 
- Hoisting
- Basic Primitive values 
  - String
  - Number
  - Boolean
  - null
  - undefined
- When to use which primitive
- How to perform basic data manipulation
- Cleaner code best practices when using primitives

___


That list sounds like a *lot* for a something intended as a step 1 to learning JavaScript, don't worry though really all you're *actually* learning is variables and some basic data structures. 

```js
var num = 5;
var name = "john" 
```

And there you go, you've learned how to use Variables and primitive values! 🥳 🎉

You can probably read it even if you don't know how to code at all, just guessing what's happening is pretty easy, you're saying `num is equal to number 5` and `name is equal to the string "john"` ...How did JavaScript know what to do there? And what's even actually happening?

Hopefully by the end of this blog you'll have a much better understanding of why we write the code in that way, what JavaScript is actually doing under the hood to make that code work and which primitive value to use when.


### Variables

Variables are essentially a name for *something*, that *something* can be, well, whatever you like. It could be any data structure, think of it like a "box" you can just put something inside and when you go to look in that box, it's there.

In JavaScript the standard is to use camelCase for variable names.

For now we'll just use `var` to assign variables, later we'll introduce `let` and `const` as other ways of assigning variables.

```js
var box = "my cool stuff";
box
```

In this example, we quite literally named our variable `box` and into that box we placed a string of `my cool stuff`. 


> **You can think about variables based on their names** this is a super useful, later on you'll need to come up with a *lot* of variable names, and it will be helpful to name them well. 


Here's what's happening when you click `Run Code`:

- **Creation Phase** 
  -  JS evaluates the code block, seeing `box` as a variable and placing it into memory
  -  the left hand assignment of `box` is **declared** - *not yet assigned! it just exists in memory now* 
  -  the value of `box` is currently `undefined` 
  -  after declaring the value it is hoisted up to the top of the script *(more on this below)*
- **Execution Phase** 
  - JS executes the code, seeing `box` is declared and has been assigned a value
  - JS runs the code to evaluate the right hand **assignment** (`=`) and assign the string of `"my cool stuff"` to `box`
  - the `alert` function then runs - `box` has been assigned the string, so the value will be `my cool stuff` that appears at the top of the browser.

___


This may seem a little confusing, what's the difference between `declared` and `assigned`?

Try running this code example and you'll see the magic happening.

```js
alert(`first alert - name is: ${name}`); // undefined

var name = "Jim" // assignment

alert(`second alert - name is: ${name}`); // "Jim"
```

If you have written any code before you may have encountered errors writing code like this, how is it possible you're trying to do something with `name` in the code before you even create it?! If you were to reference any variable that had not been **declared** you will get an error. 


```js
console.log(foo) // Uncaught ReferenceError: foo is not defined
```

So we've proven that the creation phase finished with the first `alert`, JS is aware `name` exists in memory at that point, but hasn't been `assigned` a value yet.

The second alert proves the assignment has completed and we see "Jim" appear as you would expect.

The final example proves that if there's no reference to `foo` it will simply error, which also backs up the proof that our creation phase is working like we expect.



> 👍 ⠀We've just covered an extremely advanced of JavaScript in the first few minutes and you may not have noticed it, we've just covered the global execution context, hoisting, memory, if you can understand this then you'll have a rock solid base for all future JS code.


### Expanding upon our variable knowledge

Now we have an understanding of what happens when you're assigning a variable in JS, we can expand on it and get even more out of our advanced knowledge.

#### `const` and `let` vs `var`

`var` is basically outdated JavaScript at this point, these days we use ES6 which introduced `const` and `let`. This allows us to write better code that expresses our intent properly, as well as removing some of the confusing things we saw previously with variables being `undefined` but not throwing an error if they get hoisted up.

If you're writing code today, don't use `var` unless you **really** know what you're doing and are purposefully abusing the hoisting and scope. You get around this by writing cleaner, easier to read code.

#### const

`const` is constant **assigment**

We know from our examples before that assignment is when you're changing the value a variable has, `const` stops us from doing that. 

You might wonder "Why would you ever want to stop a variable from changing?!" but when you're writing complex code you can easily lose track of the values they have, especially when working with other people. Being able to lock a value and know that `const IMPORTANT_NUMBER = 5` won't randomly somehow change to 6 by other code is **very** good, it stops a lot of bugs before they even get to become a problem.

Take this code block for example:
```js
// your code
var importantNumber = 5;
// 1000 lines of code here...
importantNumber = 8;
// someone else's code


var importantNumber = 7;
importantNumber // 7
```
Wait, what? Why is `importantNumber` `7` now?! My code relied on it being `8`! All my math is broken! Someone got billed for £700 not £800! 🔥 😱 

You can see how easy it is to lose track of a single value, especially when it can be overriden entirely if you're using `var`.

But what if we used `const` instead?

```js
const importantNumber = 5
const importantNumber = 7 // Identifier 'importantNumber' has already been declared
```

It also protects us from the number being reassigned at all.

```js
const importantNumber = 5
importantNumber = 8 // TypeError: Assignment to constant variable.
importantNumber += 1; // TypeError Assignment to constant variable.
```

But what if you **do** want to reassign? In that case you'll want to use `let`. 

#### let

`let` **can** be reassigned, so you should use it when you have a value you expect to change. It follows all the same rules as `const` scope wise, it can simply just be reassigned.

```js
let age = 0;

age = 7; // reassigns to 7
age += 1; // reassigns to age + 1
age // 8
```

However, similarly to `const` we can't **redeclare** when using `let`
```js
let age = 0;
let age = 100; // SyntaxError: Identifier 'age' has already been declared
```


#### Hoisting and scope for `let` and `const`

Previously we saw that `var` was hoisted up and we could use reference `name` before it was declared in our code, however with `let` and `const` there's something slightly different, the **decleration** is still hoisted, but can't be accessed until the **assignment** has evaluated.

```js
alert(name); // ReferenceError: Cannot access 'name' before initialization

const name = "Taylor Swift"; // same error if using let
```

For the sake of keeping things simple, you can assume that when using `let` or `const` means your variable must be declared and assigned before you can use it, which is a good thing when it comes to writing clean code that has less bugs.



### Primitives


Primitive data structures are the main values you'll come across in most of your code, when you see a name pop up on the screen, that's a string. However, when you see a number..Well, that could be a string too..Or it could be a number, that entirely depends on how the code is written.

A classic problem in JavaScript is that it's dynamically **and** loosely typed, this means a single variable can go from a `String` to a `Number` to a `Boolean` at any time and there's nothing enforcing it to stick to a specific type.

Let's start with a classic problem, you may have even encountered it already if you've tried some basic math calculation.


```js
const input = prompt('what is your age?');
alert(`You entered a ${typeof input} of ${input} your age plus 10 is: ${input + 10}`);

```

In this example it will show an alert, you'll enter an age, a `Number`, right? - Well no. `prompt` accepts a string type input (what you type into), so whatever you type into the input will be a `String`, even if you enter `22`. That's why the outcome will be a number you don't expect, the `+` sign here is actually **concatenating a number onto a string** instead of adding 2 numbers. So an input of `8` will give you `"810"`, not `18`.


We can now start figuring out how to work with each of the primitives in JS, but first we'll need to know a few things.

- Primitives are **not** objects, they are a single value in memory `5` is `5` in memory, no matter where you use it.
- JavaScript automatically [coerces](https://developer.mozilla.org/en-US/docs/Glossary/Type_coercion) values to different types depending on the function/method being used.

#### Strings

Strings are quite simple, you've already seen them being used. 

There's a few ways you can create strings:

```js
const band = "Fleetwood Mac" // string primitive
const songName = 'Dreams' // string primitive
const time = new String("4:17") // string Object
const fullTitle = `${band} - ${songName} - ${time}` // template literal

fullTitle // "Fleetwood Mac - Dreams - 4:17"
```

`band` and `songName` use the regular string primitive method of creating a string, you can use either method for creating strings, typically you'll use a style guide that will prefer one or the other. 

`time` is created using the `String` constructor. Typically you won't use this, but it's there if you really have to.

`fullTitle` is using a [template literal](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals) - this is a great way to interpolate, concatenate and even multiline strings.


You'll want your code to provide the most **intent** it can, so you may be thinking "why not just always use a template literal?!" but when you're reading code you **expect** a template literal to include some form of concatenation or inerpolation as the example shows, so if a primitive string will do then you should use that instead. 

One major reason why the method for creating the `time` string isn't good is because you're now unable to do comparisons. 

```js
const time = "4:17"
const timeString = new String("4:17");

time === timeString // false
```
When using template literal or either of the string primitive methods they will all return a string primitive, you can compare those easily and get expected values.

```js
const band = "Radiohead"
const band2 = 'Radiohead'
const band3 = `Radiohead`

band === band2 // true
band2 === band3 // true
```