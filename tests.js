{
  'use strict'

  let { testDocument } = window.PokeAtUI

  let
    testMatching = () =>
      testDocument('test-pages/matching.html', { clearOnFinish: true })
        .useCase('Button matcher', (ui, done) => {
          ui.countMatchingElements('button', 'Click aside', 1)
          ui.countMatchingElements('button', 'Click an icon', 1)
          ui.countMatchingElements('button', 'Click another icon', 1)
          ui.countMatchingElements('button', '😁', 2)
          ui.countMatchingElements('button', 'Complex label', 1)
          ui.countMatchingElements('button', '*=ex la', 1)
          ui.countMatchingElements('button', '^=Compl', 1)
          ui.countMatchingElements('button', '$=abel', 1)
          done()
        })
        .useCase('Form field matcher', (ui, done) => {
          ui.countMatchingElements('form field', 'Some input', 1)
          ui.countMatchingElements('form field', "Input 1's value", 1)
          ui.fieldShouldHaveValue('Some input', "Input 1's value")

          ui.countMatchingElements('form field', 'Input 2', 1)
          ui.countMatchingElements('form field', "Input 2's value", 1)
          ui.fieldShouldHaveValue('Input 2', "Input 2's value")

          ui.countMatchingElements('form field', /Input \d's/, 2)

          ui.countMatchingElements('form field', 'Some select', 1)
          ui.countMatchingElements('form field', 'option 1', 1)
          ui.fieldShouldHaveValue('Some select', 'option 1')

          ui.countMatchingElements('form field', 'Some text area', 1)
          ui.countMatchingElements('form field', 'There once was a text area.', 1)
          ui.fieldShouldHaveValue('Some text area', 'There once was a text area.')
          ui.fieldShouldHaveValue('Some text area', '*=once')
          ui.fieldShouldHaveValue('Some text area', '^=There once')
          ui.fieldShouldHaveValue('Some text area', '$=text area.')
          ui.fieldShouldHaveValue('Some text area', /there once.+text/i)
          done()
        })
        .useCase('Area matcher', (ui, done) => {
          ui.clickElement('area', '*=Inline text')
          ui.countMatchingElements('*', 'You clicked a main', 1)

          ui.clickElement('area', "I'm a fake region")
          ui.countMatchingElements('*', 'You clicked a div#fake-region', 1)

          ui.clickElement('area', 'Not going anywhere')
          ui.countMatchingElements('*', 'You clicked a div#labelled-fake-region', 1)

          ui.clickElement('area', 'Some text area')
          ui.countMatchingElements('*', 'You clicked a fieldset', 1)

          ui.clickElement('area', 'Some select')
          ui.countMatchingElements('*', 'You clicked a form', 1)

          ui.clickElement('area', 'Header text')
          ui.countMatchingElements('*', 'You clicked a header', 1)

          ui.clickElement('area', 'Footer text')
          ui.countMatchingElements('*', 'You clicked a footer', 1)

          ui.clickElement('area', 'Click aside')
          ui.countMatchingElements('*', 'You clicked a aside', 1)

          ui.clickElement('area', 'Section text')
          ui.countMatchingElements('*', 'You clicked a section', 1)

          done()
        })
        .useCase('Decoration matcher', (ui, done) => {
          ui.clickElement('decoration', 'Click aside')
          ui.countMatchingElements('*', 'You clicked a span', 1)

          ui.noElementsMatch('decoration', "I'm a fake region")

          done()
        })
        .useCase('Any element matcher', (ui, done) => {
          ui.countMatchingElements('*', "I'm a fake region", 1)
          ui.countMatchingElements('*', /region/, 4)
          done()
        })
        .run(testClick),
    testClick = () =>
      testDocument('test-pages/button.html', { clearOnFinish: true })
        .useCase('Click once', (ui, done) => {
          let checkChange = ui.expectLabelChange('*', '0 clicks')
          ui.clickElement('button', 'Click this')
          checkChange('1 clicks')
          done()
        })
        .useCase('Click multiple times', (ui, done) => {
          let checkChange = ui.expectLabelChange('*', '0 clicks')
          ui.clickElement('button', 'Click this')
          ui.clickElement('button', 'Click this')
          ui.clickElement('button', 'Click this')
          checkChange('3 clicks')
          done()
        })
        .run(testTyping),
    testTyping = () =>
      testDocument('test-pages/input.html', { clearOnFinish: true })
        .useCase('Type some text', (ui, done) => {
          ui.clickElement('form field', 'My text')
          ui.shouldHaveFocus('form field', 'My text')
          ui.typeIntoFocusedField('some text', thenCheck)
          function thenCheck() {
            ui.hasMatchingElements('*', 'You typed some text')
            done()
          }
        })
        .useCase('Paste text', (ui, done) => {
          ui.clickElement('form field', 'My text')
          ui.pasteIntoFocusedField('some text')
          ui.countMatchingElements('*', 'You typed some text', 1)
          done()
        })
        .run(testDragDrop),
    testDragDrop = () =>
      testDocument('test-pages/drag-drop.html', { clearOnFinish: true })
        .useCase('Grab the draggable', (ui, done) => {
          let checkChange = ui.expectLabelChange('*', 'Drop here')
          ui.grabElement('*', 'Drag me')
          checkChange('Bring it over')
          done()
        })
        .useCase('Drag over', (ui, done) => {
          let checkChange = ui.expectLabelChange('*', 'Drop here')
          ui.grabElement('*', 'Drag me')
          ui.dragGrabbedElementOver('*', 'Bring it over', thenCheck)
          function thenCheck() {
            checkChange('Drop it now')
            done()
          }
        })
        .useCase('Drop', (ui, done) => {
          let checkChange = ui.expectLabelChange('*', 'Drop here')
          ui.grabElement('*', 'Drag me')
          ui.dragGrabbedElementOver('*', 'Bring it over', thenCheck)
          function thenCheck() {
            ui.dropGrabbedElement()
            checkChange('There you go!')
            done()
          }
        })
        .useCase('Miss the drop target', (ui, done) => {
          let checkChange = ui.expectLabelChange('*', 'Drop here')
          ui.grabElement('*', 'Drag me')
          ui.dragGrabbedElementOver('*', "Don't drop here", thenCheck)
          function thenCheck() {
            checkChange('You missed it')
            done()
          }
        })
        .run(testRefresh),
    testRefresh = () =>
      testDocument('test-pages/refresh.html', { clearOnFinish: true })
        .useCase('Initial state', (ui, done) => {
          ui.hasMatchingElements('*', '*=refreshed 0 times')
          done()
        })
        .useCase('Refresh once', (ui, done) => {
          ui.refresh(thenCheck)
          function thenCheck() {
            ui.hasMatchingElements('*', '*=refreshed 1 times')
            done()
          }
        })
        .useCase('Refresh twice', (ui, done) => {
          ui.refresh(thenRefreshAgain)
          function thenRefreshAgain() {
            ui.refresh(thenCheck)
          }
          function thenCheck() {
            ui.hasMatchingElements('*', '*=refreshed 2 times')
            done()
          }
        })
        .run(testLinks),
    testLinks = () =>
      testDocument('test-pages/links.html', { clearOnFinish: true })
        .useCase('Visit a link', (ui, done) => {
          ui.clickElement('link', 'Matching')
          ui.afterPageLoad(checkUrl)
          function checkUrl() {
            ui.isAtPath('$=test-pages/matching.html')
            done()
          }
        })
        .useCase('Visit a link with query param', (ui, done) => {
          ui.clickElement('link', 'Test param')
          ui.afterPageLoad(checkUrl)
          function checkUrl() {
            ui.hasQueryParam('test', 'me')
            done()
          }
        })
        .useCase('Visit a fragment identifier', (ui, done) => {
          ui.clickElement('link', 'Section')
          ui.isAtFragment('#section')
          done()
        })
        .run()

  testMatching()
}
