import { ContentOutput, Interpreter } from '../wtcd/Interpreter';
import { Random } from '../wtcd/Random';
import { test } from './../wtcd/test';

document.body.innerHTML = '';

console.info(test);

const interpreter = new Interpreter(test, new Random(String(Math.random())));
const p = interpreter.start();

function handleOutput(output: ContentOutput | void) {
  if (output === undefined) {
    return;
  }
  output.content.forEach($element => document.body.appendChild($element));
  output.choices.forEach((choice, index) => {
    const $choice = document.createElement('button');
    $choice.innerText = choice.content;
    $choice.disabled = choice.disabled;
    document.body.appendChild($choice);
    if (!choice.disabled) {
      $choice.addEventListener('click', () => {
        handleOutput(p.next(index).value);
      });
    }
  });
}

handleOutput(p.next().value);
