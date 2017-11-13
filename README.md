# MonacoEditorKnockoutBindingHandler
A simple example project that declares a knockout binding handler to create instances of the monaco editor in browser. Doesnt use the monaco-editor npm package nor does it use node rather this example is purely client side and dynamically gets all monaco editor resources from the monaco github repo. The binding handler is written in typescript and it includes a store type collection for managing the editor instances.

## to use
- execute the tsconfig with tsc in order to generate the javascript files in the out directory.
- then launch the index.html in a browser
