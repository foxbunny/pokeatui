{
  'use strict'

  let
    HAS_TOUCH = 'ontouchstart' in document.documentElement,
    HAS_DRAG = 'ondragover' in document.documentElement,
    /**
     * Create a test suite for a given URL
     *
     * @param url - URL of the page to test (has to be same origin)
     * @param width - width of the test iframe in px
     * @param height - height of the test iframe in px
     * @param clearStorageBetweenTests - whether to clear localStorage between tests
     * @param minTypingDelay - minimum typing speed in ms per character (there is a 0~50ms jitter added to that)
     * @param testTimeout - time in ms before a test automatically fails
     */
    testDocument = (url, { width = 800, height = 600, clearStorageBetweenTests = true, minTypingDelay = 50, testTimeout = 8000 } = {}) => {
      let
        // We write the CSS directly in JS so that we can keep the test
        // framework a single file
        $styles = Object.assign(document.createElement('style'), {
          textContent: `
            #tools {
              padding: 1em 0;
              margin-bottom: 1em;
              border-bottom: 1px solid black;
            }
            
            #click-trap {
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              z-index: 9999999999999;
              background: rgba(255, 255, 255, 0.4);
              cursor: crosshair;
            }
            
            #fake-cursor {
              width: 0.7rem;
              height: 0.7rem;
              border-radius: 100%;
              background: rgba(0, 0, 0, 0.4);
              border: 2px solid rgba(255, 255, 255, 0.6);
              position: fixed;
              transform: translate(-50%, -50%);
              pointer-events: none;
            }
          `,
        }),
        $frame = document.createElement('iframe'),
        $tools = Object.assign(document.createElement('div'), {
          id: 'tools',
          innerHTML: `
            <button value="mouse-coords">Get mouse coordinate</button>
          `,
        })

      // Enable and instrument the tools and the iframe
      Object.assign($frame, { width, height })
      document.head.append($styles)
      document.body.append($tools, $frame)
      $tools.onclick = ev => {
        switch (ev.target.value) {
          case 'mouse-coords': // Get the frame-relative coordinates of a mouse click
            let $clickTrap = Object.assign(document.createElement('div'), { id: 'click-trap' })
            Object.assign($clickTrap.style, {
              top: $frame.offsetTop + 'px',
              left: $frame.offsetLeft + 'px',
              width: $frame.offsetWidth + 'px',
              height: $frame.offsetHeight + 'px',
            })
            $clickTrap.onclick = ev => {
              // We use clientX and clientY rather than screenX and screenY
              // because the latter are sensitive to the iframe's relative
              // location within the viewport. Since the click-trap takes up
              // the entire visible surface of the iframe, we can use the
              // cursor position within itself to be the same as cursor
              // position within the visible portion of the frame.
              console.log(ev.clientX - ev.target.offsetLeft, ev.clientY - ev.target.offsetTop)
              $clickTrap.remove()
            }
            document.body.append($clickTrap)
            break
        }
      }

      let
        testCases = [],
        CODES = { // translate US keyboard characters to keyboard event parameters
          '0': { key: '0', code: 'Digit0', which: 48, shiftKey: false },
          '1': { key: '1', code: 'Digit1', which: 49, shiftKey: false },
          '2': { key: '2', code: 'Digit2', which: 50, shiftKey: false },
          '3': { key: '3', code: 'Digit3', which: 51, shiftKey: false },
          '4': { key: '4', code: 'Digit4', which: 52, shiftKey: false },
          '5': { key: '5', code: 'Digit5', which: 53, shiftKey: false },
          '6': { key: '6', code: 'Digit6', which: 54, shiftKey: false },
          '7': { key: '7', code: 'Digit7', which: 55, shiftKey: false },
          '8': { key: '8', code: 'Digit8', which: 56, shiftKey: false },
          '9': { key: '9', code: 'Digit9', which: 57, shiftKey: false },
          a: { key: 'a', code: 'KeyA', which: 97, shiftKey: false },
          A: { key: 'A', code: 'KeyA', which: 65, shiftKey: true },
          b: { key: 'b', code: 'KeyB', which: 98, shiftKey: false },
          B: { key: 'B', code: 'KeyB', which: 66, shiftKey: true },
          c: { key: 'c', code: 'KeyC', which: 99, shiftKey: false },
          C: { key: 'C', code: 'KeyC', which: 67, shiftKey: true },
          d: { key: 'd', code: 'KeyD', which: 100, shiftKey: false },
          D: { key: 'D', code: 'KeyD', which: 68, shiftKey: true },
          e: { key: 'e', code: 'KeyE', which: 101, shiftKey: false },
          E: { key: 'E', code: 'KeyE', which: 69, shiftKey: true },
          f: { key: 'f', code: 'KeyF', which: 102, shiftKey: false },
          F: { key: 'F', code: 'KeyF', which: 70, shiftKey: true },
          g: { key: 'g', code: 'KeyG', which: 103, shiftKey: false },
          G: { key: 'G', code: 'KeyG', which: 71, shiftKey: true },
          h: { key: 'h', code: 'KeyH', which: 104, shiftKey: false },
          H: { key: 'H', code: 'KeyH', which: 72, shiftKey: true },
          i: { key: 'i', code: 'KeyI', which: 105, shiftKey: false },
          I: { key: 'I', code: 'KeyI', which: 73, shiftKey: true },
          j: { key: 'j', code: 'KeyJ', which: 106, shiftKey: false },
          J: { key: 'J', code: 'KeyJ', which: 74, shiftKey: true },
          k: { key: 'k', code: 'KeyK', which: 107, shiftKey: false },
          K: { key: 'K', code: 'KeyK', which: 75, shiftKey: true },
          l: { key: 'l', code: 'KeyL', which: 108, shiftKey: false },
          L: { key: 'L', code: 'KeyL', which: 76, shiftKey: true },
          m: { key: 'm', code: 'KeyM', which: 109, shiftKey: false },
          M: { key: 'M', code: 'KeyM', which: 77, shiftKey: true },
          n: { key: 'n', code: 'KeyN', which: 110, shiftKey: false },
          N: { key: 'N', code: 'KeyN', which: 78, shiftKey: true },
          o: { key: 'o', code: 'KeyO', which: 111, shiftKey: false },
          O: { key: 'O', code: 'KeyO', which: 79, shiftKey: true },
          p: { key: 'p', code: 'KeyP', which: 112, shiftKey: false },
          P: { key: 'P', code: 'KeyP', which: 80, shiftKey: true },
          q: { key: 'q', code: 'KeyQ', which: 113, shiftKey: false },
          Q: { key: 'Q', code: 'KeyQ', which: 81, shiftKey: true },
          r: { key: 'r', code: 'KeyR', which: 114, shiftKey: false },
          R: { key: 'R', code: 'KeyR', which: 82, shiftKey: true },
          s: { key: 's', code: 'KeyS', which: 115, shiftKey: false },
          S: { key: 'S', code: 'KeyS', which: 83, shiftKey: true },
          t: { key: 't', code: 'KeyT', which: 116, shiftKey: false },
          T: { key: 'T', code: 'KeyT', which: 84, shiftKey: true },
          u: { key: 'u', code: 'KeyU', which: 117, shiftKey: false },
          U: { key: 'U', code: 'KeyU', which: 85, shiftKey: true },
          v: { key: 'v', code: 'KeyV', which: 118, shiftKey: false },
          V: { key: 'V', code: 'KeyV', which: 86, shiftKey: true },
          w: { key: 'w', code: 'KeyW', which: 119, shiftKey: false },
          W: { key: 'W', code: 'KeyW', which: 87, shiftKey: true },
          x: { key: 'x', code: 'KeyX', which: 120, shiftKey: false },
          X: { key: 'X', code: 'KeyX', which: 88, shiftKey: true },
          y: { key: 'y', code: 'KeyY', which: 121, shiftKey: false },
          Y: { key: 'Y', code: 'KeyY', which: 89, shiftKey: true },
          z: { key: 'z', code: 'KeyZ', which: 122, shiftKey: false },
          Z: { key: 'Z', code: 'KeyZ', which: 90, shiftKey: true },
          '!': { key: '!', code: 'Digit1', which: 33, shiftKey: true },
          '@': { key: '@', code: 'Digit2', which: 64, shiftKey: true },
          '#': { key: '#', code: 'Digit3', which: 35, shiftKey: true },
          $: { key: '$', code: 'Digit4', which: 36, shiftKey: true },
          '%': { key: '%', code: 'Digit5', which: 37, shiftKey: true },
          '^': { key: '^', code: 'Digit6', which: 94, shiftKey: true },
          '&': { key: '&', code: 'Digit7', which: 38, shiftKey: true },
          '*': { key: '*', code: 'Digit8', which: 42, shiftKey: true },
          '(': { key: '(', code: 'Digit9', which: 40, shiftKey: true },
          ')': { key: ')', code: 'Digit0', which: 41, shiftKey: true },
          '`': { key: '`', code: 'Backquote', which: 96, shiftKey: false },
          '~': { key: '~', code: 'Backquote', which: 126, shiftKey: true },
          '-': { key: '-', code: 'Minus', which: 45, shiftKey: false },
          _: { key: '_', code: 'Minus', which: 95, shiftKey: true },
          '=': { key: '=', code: 'Equal', which: 61, shiftKey: false },
          '+': { key: '+', code: 'Equal', which: 43, shiftKey: true },
          '[': { key: '[', code: 'BracketLeft', which: 91, shiftKey: false },
          '{': { key: '{', code: 'BracketLeft', which: 123, shiftKey: true },
          ']': { key: ']', code: 'BracketRight', which: 93, shiftKey: false },
          '}': { key: '}', code: 'BracketRight', which: 125, shiftKey: true },
          '\\': { key: '\\', code: 'Backslash', which: 92, shiftKey: false },
          '|': { key: '|', code: 'Backslash', which: 124, shiftKey: true },
          ';': { key: ';', code: 'Semicolon', which: 59, shiftKey: false },
          ':': { key: ':', code: 'Semicolon', which: 58, shiftKey: true },
          '\'': { key: '\'', code: 'Quote', which: 39, shiftKey: false },
          '"': { key: '"', code: 'Quote', which: 34, shiftKey: true },
          ',': { key: ',', code: 'Comma', which: 44, shiftKey: false },
          '<': { key: '<', code: 'Comma', which: 60, shiftKey: true },
          '.': { key: '.', code: 'Period', which: 46, shiftKey: false },
          '>': { key: '>', code: 'Period', which: 62, shiftKey: true },
          '/': { key: '/', code: 'Slash', which: 47, shiftKey: false },
          '?': { key: '?', code: 'Slash', which: 63, shiftKey: true },
          ' ': { key: ' ', code: 'Space', which: 32, shiftKey: false },
        },
        NON_BUBBLING_EVENTS = ['focus', 'blur', 'load', 'unload', 'scroll'],
        NON_CANCELABLE_EVENTS = ['focus', 'blur', 'change', 'input', 'mousewheel', 'load', 'unload', 'scroll'],
        dispatchEvent = ($, type, init = {}) => {
          let
            EventCtor = Event,
            ev

          // For some events, select a more appropriate constructor
          if (type.startsWith('key')) EventCtor = KeyboardEvent
          if (type.startsWith('pointer')) EventCtor = PointerEvent
          if (type.startsWith('mouse')) EventCtor = MouseEvent
          if (type.startsWith('drag')) EventCtor = DragEvent

          init.bubbles = !NON_BUBBLING_EVENTS.includes(type)
          init.cancelable = !NON_CANCELABLE_EVENTS.includes(type)

          ev = new EventCtor(type, init)
          if (type === 'focus') $.focus()
          $.dispatchEvent(ev)
          return ev
        },
        dispatchEventChain = ($, events) => {
          // A highly inaccurate way of approximating prevented defaults, but
          // good enough in most cases.
          for (let [type, init = {}] of events) {
            let ev = dispatchEvent($, type, init)
            if (NON_CANCELABLE_EVENTS.includes(type)) continue
            if (ev.defaultPrevented) return ev
          }
        },
        keyPress = ($, init) => {
          // Simulate the entire keypress event cycle
          dispatchEvent($, 'keydown', init)
          dispatchEvent($, 'keyup', init)
          dispatchEvent($, 'keypress', init)
        },
        blurElement = $ => {
          if (!$) return
          // Remove focus from an element
          if ($.__originalValue && $.__originalValue !== $.value) {
            // Value of an input changed so we emit the change event
            dispatchEvent($, 'change')
            delete $.__originalValue
          }
          dispatchEventChain($, HAS_TOUCH ? [
            ['mouseleave'],
            ['mouseout'],
            ['blur'],
          ] : [
            ['pointerleave'],
            ['mouseleave'],
            ['blur'],
          ])
          dispatchEvent($, 'blur')
        },
        generateElementsByLabel = function * (elementType, label) {
          // Yield elements that match the element type and label.
          //
          // Element type is an abstract concept unrelated to tag names. They
          // are defined from the perspective of the end user.
          //
          // Elements with a 'hidden' attribute are not counted as existing.
          switch (elementType) {
            case 'button':
              for (let $ of $frame.contentDocument.querySelectorAll(`:is(button,[role=button]):not([hidden])`))
                if ($.textContent.includes(label)) yield $
              break
            case 'form field':
              for (let $ of $frame.contentDocument.querySelectorAll(':is(input,select,textarea):not([hidden])')) {
                let $label = $.id && $frame.contentDocument.querySelector(`label[for=${$.id}]:not([hidden])`) || $.closest('label:not([hidden])')
                if (!$label) continue
                if ($label.textContent.includes(label)) yield $
              }
              break
          }
        },
        getElementsByLabel = (elementType, label) => {
          // Get an array of elements that match the element type and label.
          // Not finding any matches is an automatic failure, so this is also
          // and assertion.
          let $$elms = Array.from(generateElementsByLabel(elementType, label))
          if ($$elms.length) return $$elms
          throw Error(`No ${elementType} elements found with label "${label}"`)
        },
        getElementByLabel = (elementType, label, position = 1) => {
          // Get a single element that match the element type and label.
          // Not finding any matches is an automatic failure, so this is also
          // and assertion. The third parameter is the order of the element
          // withing the list of all matches.
          let i = position
          for (let $ of generateElementsByLabel(elementType, label)) if (!--i) return $
          throw Error(`No ${elementType} elements found with label "${label}"`)
        },
        getElementAtCoordinates = (x, y) => {
          // Get an element at the specified coordinates. Not finding any is an
          // automatic failure in the test.
          let $ = $frame.contentDocument.elementFromPoint(x, y)
          if ($) return $
          throw Error(`No element found at point (${x}, ${y})`)
        },
        getElementsAtCoordinates = (x, y) => {
          let $$ = $frame.contentDocument.elementsFromPoint(x, y)
          if ($$.length) return $$
          throw Error(`No elements found at point (${x}, ${y})`)
        },
        getScrollingAncestor = $start => {
          let $ = $start
          while ($) {
            if ($.scrollHeight > $.offsetHeight) return $
            $ = $.parentNode
          }
          return $frame.contentWindow
        },
        clamp = (min, x, max) => Math.min(Math.max(x, min), max),
        // This is a singleton shared by all tests related to the same iframe
        uiTools = {
          // In our tests, we use timers that are related to the frame, not the
          // host page's timer. Since frames are a separate browser context,
          // we must ensure that code is placed on the event loop within that
          // context.
          clearTimeout: $frame.contentWindow.clearTimeout.bind($frame.contentWindow),
          setTimeout: $frame.contentWindow.setTimeout.bind($frame.contentWindow),
          requestAnimationFrame: $frame.contentWindow.requestAnimationFrame.bind($frame.contentWindow),
          // Page interactions
          refresh(cb) {
            $frame.contentWindow.location.reload()
            $frame.onload = () => {
              delete $frame.onload
              cb()
            }
          },
          scrollToTop() {
            $frame.contentWindow.scrollTo(0, 0)
          },
          // Mouse interactions
          clickElement(elementType, label, position = 1) {
            // Click an element with specified type and label. The third
            // parameter is the order fo the element in the list of all
            // matching element.
            let
              $focusedElement = $frame.contentDocument.activeElement,
              $ = getElementByLabel(elementType, label, position),
              alreadyHasFocus = $focusedElement === $,
              events

            if (!alreadyHasFocus) blurElement($focusedElement)

            if (HAS_TOUCH) {
              events = [
                ['pointerover'],
                ['pointerenter'],
                ['pointerdown'],
                ['touchstart'],
                ['pointerup'],
                ['pointerout'],
                ['pointerleave'],
                ['touchend'],
                ['mouseover'],
                ['mouseenter'],
                ['mousemove'],
                ['mousedown'],
              ]
              if ($ !== $frame.contentDocument.activeElement) events.push(['focus'])
              events.push(
                ['mouseup'],
                ['click'],
              )
            }
            else {
              events = alreadyHasFocus
                ? []
                : [
                  ['pointerover'],
                  ['pointerenter'],
                  ['mouseover'],
                  ['mouseenter'],
                ]
              events.push(
                ['pointerdown'],
                ['mousedown'],
              )
              if ($ !== $frame.contentDocument.activeElement) events.push(['focus'])
              events.push(
                ['pointerup'],
                ['mouseup'],
                ['click'],
              )
            }
            dispatchEventChain($, events)

            // Some special cases where clicking also changes the value
            if ($.tagName === 'INPUT' && $.type === 'checkbox') {
              $.checked = !$.checked
              $.indeterminate = false
              dispatchEvent($, 'change')
            }
            if ($.tagName === 'INPUT' && $.type === 'radio' && !$.checked) {
              $.checked = true
              dispatchEvent($, 'change')
            }
          },
          grabElementAtPoint(x, y) {
            // Simulates the first step of the drag & drop action. This is not
            // strictly for elements with the draggable attribute. Full suite
            // of pointer and mouse events are simulated.

            // We cannot grab two elements at once
            if ($frame.contentDocument.__grabbedElement)
              throw Error('There is already a grabbed element. You must drop it first.')

            let
              $ = getElementAtCoordinates(x, y),
              mouseInit = {
                screenX: x,
                screenY: y,
                clientX: x - $.offsetLeft,
                clientY: y - $.offsetTop,
              },
              dataTransfer = new DataTransfer()

            // Store the state within the document. We could have stored this
            // on the host document to avoid potentially stepping on the
            // properties set by the document under test, but we don't want to
            // risk inconsistent state in case the tested document reloads.
            $frame.contentDocument.__grabbedElement = $
            $.__startX = x
            $.__startY = y
            $.__dataTransfer = dataTransfer

            if ($frame.contentDocument.activeElement !== $) blurElement($frame.contentDocument.activeElement)

            let events = HAS_TOUCH
              ? [
                ['pointerover', mouseInit],
                ['pointerenter', mouseInit],
                ['pointerdown', mouseInit],
                ['touchstart', { touches: [mouseInit] }],
                ['pointerup', mouseInit],
                ['pointerout', mouseInit],
                ['pointerleave', mouseInit],
                ['touchend', { touches: [mouseInit] }],
                ['mouseover', mouseInit],
                ['mouseenter', mouseInit],
                ['mousemove', mouseInit],
                ['mousedown', mouseInit],
              ]
              : [
                ['pointerenter', mouseInit],
                ['pointerdown', mouseInit],
                ['mouseenter', mouseInit],
                ['mousedown', mouseInit],
              ]
            if ($.draggable && HAS_DRAG) events.push(['dragstart', { ...mouseInit, dataTransfer }])
            dispatchEventChain($, events)
          },
          dragGrabbedElementBy: function (distX, distY, cb) {
            // This is the dragging portion of drag & drop. We move by the
            // specified distances

            if (!$frame.contentDocument.__grabbedElement)
              throw Error('There is no grabbed element. You must grab one first.')

            let
              $ = $frame.contentDocument.__grabbedElement,
              dataTransfer = $.__dataTransfer,
              $scrollingAncestor = getScrollingAncestor($),
              currX = $.__startX,
              currY = $.__startY,
              vX = distX / 50,
              vY = distY / 50,
              $fakeCursor = Object.assign(document.createElement('div'), { id: 'fake-cursor' }),
              updateCursor = () => Object.assign($fakeCursor.style, {
                left: `${currX + $frame.offsetLeft}px`,
                top: `${currY + $frame.offsetTop}px`,
              }),
              $$elsContainingCursor = Array.from(getElementsAtCoordinates(currX, currY))

            // Add a fake cursor to visualize the drag motion. We add the cursor
            // to the host document so it does not interfere with the document
            // under test.
            document.body.append($fakeCursor)
            updateCursor()

            ;(function move() {
              let
                reachedX = !Math.round(distX),
                reachedY = !Math.round(distY)

              // We only end the drag motion when we reach the destination
              // along both axes.
              if (reachedX && reachedY) {
                // Reset the start coordinates in case we decide to drag again,
                // and we also remember the last cursor position so that we can
                // execute the drop with correct coordinates.
                $.__startX = $.__lastX = currX
                $.__sartY = $.__lastY = currY
                $fakeCursor.remove()
                cb()
                return
              }

              if (!reachedX) {
                let overshoot = (currX + vX) - (currX = clamp(10, currX + vX, width - 10))
                $scrollingAncestor.scrollBy(overshoot, 0)
                distX -= vX
              }
              if (!reachedY) {
                let overshoot = (currY + vY) - (currY = clamp(10, currY + vY, height - 10))
                $scrollingAncestor.scrollBy(0, overshoot)
                distY -= vY
              }

              updateCursor()

              // Find any element under the cursor and trigger pointer events
              // on it.
              let
                $$elsUnderCursor = getElementsAtCoordinates(currX, currY),
                mouseInit = {
                  screenX: currX,
                  screenY: currY,
                  clientX: currX - $$elsUnderCursor[0].offsetLeft,
                  clientY: currY - $$elsUnderCursor[0].offsetTop,
                }

              // touchmove only triggers on the ORIGINAL element, not the
              // element over which the cursor is moving. However, point
              // events *do* trigger on the element under the cursor.
              if (HAS_TOUCH) dispatchEvent($, 'touchmove', { touches: [mouseInit] })

              // Elements which the cursor has left
              for (let $elWithCursor of $$elsContainingCursor) {
                if ($$elsUnderCursor.includes($elWithCursor)) continue
                dispatchEventChain($elWithCursor, [
                  ['pointerleave', mouseInit],
                  ['mouseleave', mouseInit],
                  ['dragleave', { ...mouseInit, dataTransfer }],
                ])
              }

              for (let $elUnderCursor of $$elsUnderCursor) {
                if (!$$elsContainingCursor.includes($elUnderCursor)) {
                  // Elements the cursor has entered
                  let events = [
                    ['pointerenter', mouseInit],
                    ['mouseenter', mouseInit],
                  ]
                  if ($.draggable && HAS_DRAG) events.push(['dragenter', { ...mouseInit, dataTransfer }])
                  dispatchEventChain($elUnderCursor, events)
                }

                let events = [
                  ['pointermove', mouseInit],
                  ['mousemove', mouseInit],
                ]
                if ($.draggable && HAS_DRAG) events.push(['dragover', { ...mouseInit, dataTransfer }])
                dispatchEventChain($elUnderCursor, events)
              }

              // Update the list
              $$elsContainingCursor = Array.from($$elsUnderCursor)

              // Perform the next step in the move
              this.setTimeout(move, 10)
            }())
          },
          dropGrabbedElement() {
            // This is the release phase in the drag & drop motion.

            if (!$frame.contentDocument.__grabbedElement)
              throw Error('There is no grabbed element. You must grab one first.')

            let
              $ = $frame.contentDocument.__grabbedElement,
              lastX = $.__lastX,
              lastY = $.__lastY,
              $elUnderCursor = getElementAtCoordinates(lastX, lastY),
              dataTransfer = $.__dataTransfer,
              mouseInit = {
                screenX: lastX,
                screenY: lastY,
                clientX: lastX - $.offsetLeft,
                clientY: lastY - $.offsetTop,
              }

            // Remove all tracked state
            delete $frame.contentDocument.__grabbedElement
            delete $.__startX
            delete $.__startY
            delete $.__lastX
            delete $.__lastY
            delete $.__dataTransfer

            // touchend only triggers on the ORIGINAL element, not the
            // element over which the cursor is moving. However, point
            // events *do* trigger on the element under the cursor.
            if (HAS_TOUCH) dispatchEvent($, 'touchend', { touches: [mouseInit] })
            let events = [
              ['pointerup', mouseInit],
              ['mouseup', mouseInit],
            ]
            if ($.draggable && HAS_DRAG) events.push(['dragend', { ...mouseInit, dataTransfer }])
            dispatchEventChain($elUnderCursor, events)
          },
          // Text-related actions
          typeIntoFocusedField(text, cb) {
            // Simulate typing into an input. This is an async function as it
            // uses the timer to simulate delays between key presses.
            let $ = $frame.contentDocument.activeElement

            if (!$) throw Error(`No focused element found`)

            // Remember the original value before typing in order to simulate
            // the change event on blur.
            $.__originalValue ??= $.value
            let chars = text.split('')
            ;(function typeNextChar() {
              if (!chars.length) return cb()
              let chr = chars.shift()
              $.value += chr
              keyPress($, CODES[chr] || { key: chr, shiftKey: false })
              dispatchEvent($, 'input')
              this.setTimeout(typeNextChar, minTypingDelay + Math.random() * 50)
            }())
          },
          pasteIntoFocusedField(text) {
            // Simulate pasting into a form field.
            let $ = $frame.contentDocument.activeElement
            $.__originalValue ??= $.value
            keyPress($, { ...CODES.v, ctrlKey: true })
            $.value += text
            dispatchEvent($, 'input')
          },
          // Assert element count
          noElementsMatch(elementType, label) {
            // Check that there are no elements that match the element type and
            // label.
            for (let $ of generateElementsByLabel(elementType, label))
              throw Error(`Expected no elements of ${elementType} with label "${label}" but got at least one`)
          },
          countElementsWithLabel(elementType, label, count) {
            // Check that there is a specified number of elements that match the
            // element type and label.
            let $$elms = getElementsByLabel(elementType, label)
            if ($$elms.length !== count) throw Error(`Expected ${count} ${elementType} elements with label "${label}", but found ${$$elms.length}`)
          },
          // Assert element state
          shouldHaveFocus(elementType, label, position = 1) {
            // Check that the element matching the element type and label has
            // focus.
            let $ = getElementByLabel(elementType, label, position)
            if ($frame.contentDocument.activeElement === $) return
            throw Error(`Expected ${elementType} element with label "${label}" to have focus, but it does not`)
          },
          // Assert element value
          fieldShouldHaveValue(label, value, position = 1) {
            // Check that the a form field element with specified label has
            // the specified value.
            let $ = getElementByLabel('form field', label, position)
            switch ($.type) {
              case 'checkbox':
              case 'radio':
                // For checkboxes/radios we use human-readable labels for the state
                if (value === 'checked' && $.checked) return
                if (value === 'unchecked' && !$.checked) return
                if (value === 'indeterminate' && $.indeterminate) return
                break
              default:
                // For all other inputs, we are looking for an exact value match
                if ($.value === value) return
            }
            throw Error(`Expected form field with label "${label}" to have value "${value}", but instead it has "${$.value}"`)
          },
        }

      // Organize and run tests
      return {
        useCase(label, testCode) {
          // Register a use case. This does not execute the tests.
          testCases.push([label, testCode])
          return this
        },
        run() {
          // Run the test suite. Test are run one by one, not in parallel.
          // This way or running the tests is slower, but we avoid a whole
          // class of issues stemming from shared resources such as
          // localStorage, indexedDB, and similar.
          let
            currentTestIdx = 0,
            testSuiteFailed = false,
            // Save a snapshot of the localStorage because we're testing a
            // live page
            currentLocalStorageContent = JSON.stringify($frame.contentWindow.localStorage),
            finish = () => {
              // Restore the snapshot of the local storage when the frame
              // unloads (by user's closing the host page tab).
              $frame.contentWindow.addEventListener('beforeunload', () => {
                uiTools.setTimeout(() => {
                  Object.assign($frame.contentWindow.localStorage, JSON.parse(currentLocalStorageContent))
                }, 1) // add a timeout in case the page under test also stores something on unload
              }, { once: true })
            }

          ;(function runNextCase() {
            if (currentTestIdx >= testCases.length || testSuiteFailed) return finish()

            let
              [label, testCode] = testCases[currentTestIdx++],
              startTime, // this will be set in the last moment before actual test runs
              autofailTimeout = null, // timer ID for automatic timeout failure
              testDone = false,
              cleanUp = () => {
                testDone = true
                uiTools.clearTimeout(autofailTimeout)
              },
              passCurrentTest = () => {
                let testDuration = performance.now() - startTime
                if (testDone) return // Ignore calls made after the test concluded
                cleanUp()
                console.log(`PASS: ${label} (${testDuration.toFixed(2)}ms)`)
                runNextCase()
              },
              failCurrentTest = error => {
                if (testDone) return // Ignore calls made after the test concluded
                cleanUp()
                testSuiteFailed = true // On first failure, we stop executing further tests
                console.trace(`FAIL: ${label}\n${error}`)
                runNextCase()
              }

            // Reset the frame contents by completely unloading it
            $frame.src = ''
            $frame.onload = () => {
              // Load the test page again, and clean up storage if needed
              if (clearStorageBetweenTests) $frame.contentWindow.localStorage.clear()
              $frame.src = url
              $frame.onload = () => {
                // Remove the onload event listener so it is not invoked again
                // (e.g., by test code requesting a reload)
                delete $frame.onload
                // Test will fail automatically on exceptions within the page.
                $frame.contentWindow.onerror = failCurrentTest
                uiTools.setTimeout(() => {
                  startTime = performance.now() // record start time
                  // Test passes if the test code is able to call the second
                  // callback before the failure callback is called due to
                  // an exception, timeout, or some other reason.
                  testCode(uiTools, passCurrentTest)
                }, 1) // ~1ms wait in order for layout & paint to settle
              }
              // Set auto-fail timer. Any test that takes longer than
              // testTimeout should automatically fail, even if it actually
              // passes given enough time.
              autofailTimeout = setTimeout(failCurrentTest, testTimeout, Error(`Test has timed out`))
            }
          }())
        },
      }
    }

  console.table({ HAS_DRAG, HAS_TOUCH })

  // This script is CommonJS-compatible
  if (typeof module === 'object' && typeof require === 'function') {
    module.exports = { testDocument }
  }
  else {
    window.PokeAtUI = { testDocument }
  }
}
