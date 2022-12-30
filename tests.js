{
  'use strict'

  let { testDocument } = window.PokeAtUI

  let
    testMatching = () =>
      testDocument('test-pages/matching.html', { clearOnFinish: true })
        .useCase('Button matcher', (ui, done) => {
          ui.countElementsWithLabel('button', 'Click aside', 1)
          ui.countElementsWithLabel('button', 'Click an icon', 1)
          ui.countElementsWithLabel('button', 'Click another icon', 1)
          ui.countElementsWithLabel('button', '😁', 2)
          ui.countElementsWithLabel('button', 'Complex label', 1)
          ui.countElementsWithLabel('button', '*=ex la', 1)
          ui.countElementsWithLabel('button', '^=Compl', 1)
          ui.countElementsWithLabel('button', '$=abel', 1)
          done()
        })
        .useCase('Form field matcher', (ui, done) => {
          ui.countElementsWithLabel('form field', 'Some input', 1)
          ui.countElementsWithLabel('form field', "Input 1's value", 1)
          ui.fieldShouldHaveValue('Some input', "Input 1's value")

          ui.countElementsWithLabel('form field', 'Input 2', 1)
          ui.countElementsWithLabel('form field', "Input 2's value", 1)
          ui.fieldShouldHaveValue('Input 2', "Input 2's value")

          ui.countElementsWithLabel('form field', /Input \d's/, 2)

          ui.countElementsWithLabel('form field', 'Some select', 1)
          ui.countElementsWithLabel('form field', 'option 1', 1)
          ui.fieldShouldHaveValue('Some select', 'option 1')

          ui.countElementsWithLabel('form field', 'Some text area', 1)
          ui.countElementsWithLabel('form field', 'There once was a text area.', 1)
          ui.fieldShouldHaveValue('Some text area', 'There once was a text area.')
          ui.fieldShouldHaveValue('Some text area', '*=once')
          ui.fieldShouldHaveValue('Some text area', '^=There once')
          ui.fieldShouldHaveValue('Some text area', '$=text area.')
          ui.fieldShouldHaveValue('Some text area', /there once.+text/i)
          done()
        })
        .useCase('Area matcher', (ui, done) => {
          ui.clickElement('area', '*=Inline text')
          ui.countElementsWithLabel('*', 'You clicked a main', 1)

          ui.clickElement('area', "I'm a fake region")
          ui.countElementsWithLabel('*', 'You clicked a div#fake-region', 1)

          ui.clickElement('area', 'Not going anywhere')
          ui.countElementsWithLabel('*', 'You clicked a div#labelled-fake-region', 1)

          ui.clickElement('area', 'Some text area')
          ui.countElementsWithLabel('*', 'You clicked a fieldset', 1)

          ui.clickElement('area', 'Some select')
          ui.countElementsWithLabel('*', 'You clicked a form', 1)

          ui.clickElement('area', 'Header text')
          ui.countElementsWithLabel('*', 'You clicked a header', 1)

          ui.clickElement('area', 'Footer text')
          ui.countElementsWithLabel('*', 'You clicked a footer', 1)

          ui.clickElement('area', 'Click aside')
          ui.countElementsWithLabel('*', 'You clicked a aside', 1)

          ui.clickElement('area', 'Section text')
          ui.countElementsWithLabel('*', 'You clicked a section', 1)

          done()
        })
        .useCase('Decoration matcher', (ui, done) => {
          ui.clickElement('decoration', 'Click aside')
          ui.countElementsWithLabel('*', 'You clicked a span', 1)

          ui.noElementsMatch('decoration', "I'm a fake region")

          done()
        })
        .useCase('Any element matcher', (ui, done) => {
          ui.countElementsWithLabel('*', "I'm a fake region", 1)
          ui.countElementsWithLabel('*', /region/, 4)
          done()
        })
        .run(testClick),
    testClick = () =>
      testDocument('test-pages/button.html', { clearOnFinish: true })
        .useCase('Click once', (ui, done) => {
          ui.clickElement('button', 'Click this')
          ui.countElementsWithLabel('*', '1 clicks', 1)
          done()
        })
        .useCase('Click multiple times', (ui, done) => {
          ui.clickElement('button', 'Click this')
          ui.clickElement('button', 'Click this')
          ui.clickElement('button', 'Click this')
          ui.countElementsWithLabel('*', '3 clicks', 1)
          done()
        })
        .run(testTyping),
    testTyping = () =>
      testDocument('test-pages/input.html', { clearOnFinish: true })
        .useCase('Type some text', (ui, done) => {
          ui.clickElement('form field', 'My text')
          ui.typeIntoFocusedField('some text', thenCheck)
          function thenCheck() {
            ui.countElementsWithLabel('*', 'You typed some text', 1)
            done()
          }
        })
        .useCase('Paste text', (ui, done) => {
          ui.clickElement('form field', 'My text')
          ui.pasteIntoFocusedField('some text')
          ui.countElementsWithLabel('*', 'You typed some text', 1)
          done()
        })
        .run(testDragDrop),
    testDragDrop = () =>
      testDocument('test-pages/drag-drop.html', { clearOnFinish: true })
        .useCase('Grab the draggable', (ui, done) => {
          ui.grabElement('*', 'Drag me')
          ui.countElementsWithLabel('*', 'Bring it over', 1)
          done()
        })
        .useCase('Drag over', (ui, done) => {
          ui.grabElement('*', 'Drag me')
          ui.dragGrabbedElementOver('*', 'Bring it over', thenCheck)
          function thenCheck() {
            ui.countElementsWithLabel('*', 'Drop it now', 1)
            done()
          }
        })
        .useCase('Drop', (ui, done) => {
          ui.grabElement('*', 'Drag me')
          ui.dragGrabbedElementOver('*', 'Bring it over', thenCheck)
          function thenCheck() {
            ui.dropGrabbedElement()
            ui.countElementsWithLabel('*', 'There you go!', 1)
            done()
          }
        })
        .run()

  testMatching()
}
