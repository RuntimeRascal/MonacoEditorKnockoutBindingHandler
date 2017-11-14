/*!
 * @file
 * file contains code that extends the knockout object by including a custom knockout monaco editor 
 * binding handler. Also attached to the global knockout object is a editor collection object for persisting and manipulating editor
 * instances. Finally, file contains code that registers the binding handler, generates custom editor store,
 * and configures size updates and layout updates between window object and all editor instances created by binding handler.
 *
 * @summary   Monaco-editor knockout binding handler
 *
 * link:      https://github.com/simpert/MonacoEditorKnockoutBindingHandler/blob/master/monacoEditorBindingHandler.ts
 * 
 * Author:    TSimper
 * Created:   2017-10-22 at 4:22 PM
 * Name:      moncaoEditorBindinghanlder.ts
 *
 * @example how to use the custom knockout binding handler
 * ```html
 * <div class="editor" data-bind="moncao: codeModelValue,
 *  options: {
 *      language: 'javascript',
 *      theme: 'vs|vs-dark|hc-black',
 *      lineNumbers: 'on|off',
 *      roundedSelection: 'true|false',
 *      scrollBeyondLastLine: 'true|false',
 *      readOnly: 'true|false',
 *      fontSize: '20',
 *      autoIndent: 'true|false'
 * }">
 * </div>
 * ```
 * Copyright (c) 2017 SimperFactory
 */




module my
{
    const editorDomElementIdPrefix: string = 'knockout-monaco-';

    export interface IMonacoEditorsStore
    {

        /**
         * update's layout or size of all editors currently in the store.
         * 
         * @memberof IMonacoEditorsStore
         */
        resizeAll (): void;

        /**
         * get a editor from the store by unique id
         * 
         * @param {string} id id of dom element representing a monaco-editor
         * @returns {monaco.editor.ICodeEditor} the editor with unique id matching id or null if no editor in store matches id
         * @memberof IMonacoEditorStore
         */
        get ( id: string ): monaco.editor.ICodeEditor;

        /**
         * create a editor instance from the DOM element element configured with all valid 
         * parsable options found in the koOptionsObject object literal and persist in the 
         * IMonacoEditorStore
         * 
         * @param {HTMLElement} element a DOM element to create the editor within
         * @param {*} koOptionsObject a object literal of monaco editor options. 
         * @param {() => any} koModelPropAccessor a knockout model accessor function
         * @memberof IMonacoEditorStore
         * @see https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.ieditorconstructionoptions.html
         * @example To create new editor and persist
         * ```typescript
         * // from within a binding handler function that has a value accessor available
         * let e = document.createElement("div");
         * let store  = new MonacoEditorStore();
         * let o = store.parseOptions({
         *     language : 'javascript',
         *     theme: 'vs-dark'
         * });
         * 
         * store.create(e, o, valueAccessor);;
         * 
         * // then if need access to it
         * let editor = store.get(e.id);
         * ```
         */
        create ( element: HTMLElement, options: any, koModelPropAccessor: () => any ): void;

        /**
         * *** Similiar to '`Store.Length > 0`' ***
         * determine if the store contains any editors
         * 
         * @returns {boolean} true if one or more editor instances are found in the store; false otherwise
         * @memberof IMonacoEditorStore
         */
        hasEditors (): boolean;

        /**
         * ** Update created bound editor when ko value changes **
         * update the editor's current model value if value is not equal to koModelValue
         * 
         * @param {string} id store unique identifier
         * @param {string} koModelValue a string value of code to update the editors model value with
         * @memberof IMonacoEditorStore
         */
        updateEditor ( id: string, koModelValue: string ): void;
    };

    /**
     * A code editor factory and store
     * 
     * @export
     * @class MonacoEditorStore
     * @implements {my.IMonacoEditorsStore}
     */
    export class MonacoEditorStore implements IMonacoEditorsStore
    {
        /**
         * convert a object literal of options into a monaco editor compatible options object with default values for 
         * options that are not specified.
         * 
         * @private
         * @param {*} optionsObjectLiteral a json or object literal describing one or more monaco editor options
         * @returns {monaco.editor.IEditorConstructionOptions} a strongly typed object representing options for configuring 
         * monaco editor instances
         * @memberof MonacoEditorStore
         */
        private parseOptions ( optionsObjectLiteral: any ): monaco.editor.IEditorConstructionOptions
        {

            let options = optionsObjectLiteral as monaco.editor.IEditorConstructionOptions || {} as monaco.editor.IEditorConstructionOptions;

            if ( !options.language )
                options.language = 'javascript';

            if ( !options.theme )
                options.theme = 'vs-dark';

            if ( !options.lineNumbers )
                options.lineNumbers = 'on';

            if ( !options.roundedSelection )
                options.roundedSelection = true;

            if ( !options.scrollBeyondLastLine )
                options.scrollBeyondLastLine = true;

            if ( !options.readOnly )
                options.readOnly = false;

            if ( !options.fontSize )
                options.fontSize = 20;

            if ( !options.autoIndent )
                options.autoIndent = true;

            if ( !options.emptySelectionClipboard )
                options.emptySelectionClipboard = true;

            if ( !options.folding )
                options.folding = true;

            if ( !options.glyphMargin )
                options.glyphMargin = true;

            if ( !options.mouseWheelZoom )
                options.mouseWheelZoom = true;

            if ( !options.parameterHints )
                options.parameterHints = true;

            if ( !options.renderIndentGuides )
                options.renderIndentGuides = true;

            if ( !options.minimap )
                options.minimap = { enabled: true, showSlider: "mouseover" };


            // for ( const key in optionsObjectLital ) 
            // {
            //     if ( my.EditorOptionsBase.hasOwnProperty( key ) ) 
            //     {
            //         ( editorOptions as any )[ key ] = optionsObjectLital[ key ]
            //     }
            // }

            return options;
        }

        /**
         * seed to aid in creating unique id's for the store
         * 
         * @private
         * @type {number}
         * @memberof MonacoEditorStore
         */
        private _nextStoreEntryId: number;

        /**
         * a indexable store for persisting editor instances by unique id
         * 
         * @private
         * @type {{ [ key: string ]: monaco.editor.ICodeEditor }} the editor store
         * @memberof MonacoEditorStore
         */
        private _monacoEditorInstances: { [ key: string ]: monaco.editor.ICodeEditor };

        /**
         * Create and initialize an instance of MonacoEditorStore.
         * @memberof MonacoEditorStore
         */
        constructor ()
        {
            this._monacoEditorInstances = {};
            this._nextStoreEntryId = 0;
        }

        private getNextId (): string
        {
            this._nextStoreEntryId += 1;
            //return `knockout-monaco-${ this._monacoEditorIdSeed }`
            return `${ editorDomElementIdPrefix }${ this._nextStoreEntryId }`
        }

        private disposeEditor ( id: string ): void
        {
            this._monacoEditorInstances[ id ].dispose();
            delete this._monacoEditorInstances[ id ];
        }

        /**
         * update's layout or size of all editors currently in the store.
         * 
         * @memberof MonacoEditorStore
         * @extends IMonacoEditorStore
         */
        resizeAll (): void
        {
            for ( var id in this._monacoEditorInstances )
            {
                if ( !this._monacoEditorInstances.hasOwnProperty( id ) )
                    continue;

                var editor = this._monacoEditorInstances[ id ];
                editor.layout();
            }
        }

        /**
         * get a editor from the store by unique id
         * 
         * @param {string} id id of dom element representing a monaco-editor
         * @returns {monaco.editor.ICodeEditor} the editor with unique id matching  id or null if no editor in store 
         * matches id
         * @memberof my.IMonacoEditorStore
         * @extends IMonacoEditorStore
         */
        get ( id: string ): monaco.editor.ICodeEditor
        {
            if ( id === null || id === '' )
                throw new Error( "the id argument may not be null, empty, undefined, or blank" );

            return this._monacoEditorInstances[ id ];
        }

        /**
         * create a editor instance from the DOM element element configured with all valid 
         * parsable options found in the koOptionsObject object literal and persist in the 
         * IMonacoEditorStore
         * 
         * @param {HTMLElement} element a DOM element to create the editor within
         * @param {*} koOptionsObject a object literal of monaco editor options. 
         * @param {() => any} koModelPropAccessor a knockout model accessor function
         * @memberof MonacoEditorStore
         * @extends IMonacoEditorStore
         * @see https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.ieditorconstructionoptions.html
         * @example To create new editor and persist
         * ```typescript
         * // from within a binding handler function that has a value accessor available
         * let e = document.createElement("div");
         * let store  = new MonacoEditorStore();
         * let o = store.parseOptions({
         *     language : 'javascript',
         *     theme: 'vs-dark'
         * });
         * 
         * store.create(e, o, valueAccessor);;
         * 
         * // then if need access to it
         * let editor = store.get(e.id);
         * ```
         */
        create ( element: HTMLElement, options: any, koModelPropAccessor: () => any ): void
        {
            // ensure that the element has a valid id
            if ( !element.id )
                element.id = this.getNextId();

            // get the actual value of the ko model prop this binding is for
            let startingEditorValue = ko.utils.unwrapObservable( koModelPropAccessor() );

            require( [ 'vs/editor/editor.main' ], () =>
            {
                let parsedOptions = this.parseOptions( options );

                parsedOptions.model = monaco.editor.createModel( startingEditorValue, parsedOptions.language );

                // create an editor instance
                let editor = monaco.editor.create( element, parsedOptions );

                // when editor value changes, update the knockout field
                editor.onDidChangeModelContent( ( e ) =>
                {
                    var koModelProp = koModelPropAccessor();

                    if ( ko.isWriteableObservable( koModelProp ) )
                        // we need to bind ko model prop and editor value prop
                        koModelProp( ko.monacoEditors.get( element.id ).getValue() );
                } );

                // handle disposing of the editor preoperly
                ko.utils.domNodeDisposal.addDisposeCallback( element, () =>
                {
                    //this.disposeEditor( element.id );
                    this._monacoEditorInstances[ element.id ].dispose();
                    delete this._monacoEditorInstances[ element.id ];
                } );

                // persist the editor
                this._monacoEditorInstances[ element.id ] = editor;
            } );
        }


        /**
         * *** Similiar to '`Store.Length > 0`' ***
         * determine if the store contains any editors
         * 
         * @returns {boolean} true if one or more editor instances are found in the store; false otherwise
         * @memberof MonacoEditorStore
         * @extends IMonacoEditorStore
         */
        hasEditors (): boolean
        {
            let hasInstances = false;
            for ( var id in this._monacoEditorInstances )
            {
                if ( hasInstances || !this._monacoEditorInstances.hasOwnProperty( id ) )
                    continue;

                hasInstances = true;
            }

            return hasInstances;
        }

        /**
         * ** Update created bound editor when ko value changes **
         * *update the editor's current model value if value is not equal to koModelValue*
         * 
         * @param {string} id store unique identifier
         * @param {string} koModelValue a string value of code to update the editors model value with
         * @memberof MonacoEditorStore
         * @extends IMonacoEditorStore
         */
        updateEditor ( id: string, koModelValue: string )
        {
            if ( id !== null && id !== '' && this._monacoEditorInstances.hasOwnProperty( id ) )
            {
                var editor = this._monacoEditorInstances[ id ];

                // don't update if the values are the same
                if ( editor.getValue() !== koModelValue )
                {
                    editor.setValue( koModelValue );

                    // navigate to the editor begining
                    editor.setPosition( {
                        column: 0,
                        lineNumber: 0
                    } as monaco.IPosition )
                }
            }
        }
    }

    /**
     * A knockout binding handler implementation to create monaco code editor instances and bind with knockout view model
     * 
     * @class MonacoBindingHandlerHelper
     * @implements {KnockoutBindingHandler}
     */
    class MonacoBindingHandlerHelper implements KnockoutBindingHandler
    {
        init =
            /**
            * Knockout will call your init function once for each DOM element that you use the binding on. There 
            * are two main uses for init:
            *  - To set any initial state for the DOM element
            *  - To register any event handlers so that, for example, when the user clicks on or modifies the DOM element, 
            *       you can change the state of the associated observable
            * KO will pass exactly the same set of parameters that it passes to the update callback.
            * @param {HTMLElement} element — The DOM element involved in this binding
            * @param {() => any} valueAccessor — A JavaScript function that you can call to get the current model property 
            * that is involved in this binding. Call this without passing any parameters (i.e., call valueAccessor()) to 
            * get the current model property value. To easily accept both observable and plain values, call ko.unwrap on 
            * the returned value.
            * @param {KnockoutAllBindingsAccessor} allBindingsAccessor — A JavaScript object that you can use to access 
            * all the model values bound to this DOM element. Call allBindings.get('name') to retrieve the value of the 
            * name binding (returns undefined if the binding doesn’t exist); or allBindings.has('name') to determine if 
            * the name binding is present for the current element.
            * @param {*} viewModel — This parameter is deprecated in Knockout 3.x. Use bindingContext.$data or 
            * bindingContext.$rawData to access the view model instead.
            * @param {KnockoutBindingContext} bindingContext — An object that holds the binding context available to this 
            * element’s bindings. This object includes special properties including $parent, $parents, and $root that can 
            * be used to access data that is bound against ancestors of this context.
            */
            function ( element: HTMLElement, valueAccessor: () => any, allBindingsAccessor: KnockoutAllBindingsAccessor, viewModel: any, bindingContext: KnockoutBindingContext )
            {
                console.debug( 'executing the ko monaco init handler' );

                let options: monaco.editor.IEditorConstructionOptions;
                if ( allBindingsAccessor.has( 'meOptions' ) )
                {
                    options = allBindingsAccessor.get( 'meOptions' ) || {};
                } else
                {
                    //TODO: handle this case by creating default options. Will allow a more simple DOM declaration
                    throw new Error( 'a "meOptions" property cannot be found on the monaco-editor DOM nockout binding' )
                }

                ko.monacoEditors.create( element, options, valueAccessor );
            }
        update =
            /**
            * Knockout will call the update callback initially when the binding is applied to an element and track any 
            * dependencies (observables/computeds) that you access. When any of these dependencies change, the update 
            * callback will be called once again. The following parameters are passed to it:
            * @param {HTMLElement} element — The DOM element involved in this binding
            * @param {() => any} valueAccessor — A JavaScript function that you can call to get the current model property 
            * that is involved in this binding. Call this without passing any parameters (i.e., call valueAccessor()) to 
            * get the current model property value. To easily accept both observable and plain values, call ko.unwrap on 
            * the returned value.
            * @param {KnockoutAllBindingsAccessor} allBindingsAccessor — A JavaScript object that you can use to access 
            * all the model values bound to this DOM element. Call allBindings.get('name') to retrieve the value of the 
            * name binding (returns undefined if the binding doesn’t exist); or allBindings.has('name') to determine if 
            * the name binding is present for the current element.
            * @param {*} viewModel — This parameter is deprecated in Knockout 3.x. Use bindingContext.$data or 
            * bindingContext.$rawData to access the view model instead.
            * @param {KnockoutBindingContext} bindingContext — An object that holds the binding context available to this 
            * element’s bindings. This object includes special properties including $parent, $parents, and $root that can be used to access data that is bound against ancestors of this context.
            */
            function ( element: HTMLElement, valueAccessor: () => any, allBindingsAccessor: KnockoutAllBindingsAccessor, viewModel: any, bindingContext: KnockoutBindingContext )
            {
                console.debug( 'executing the ko monaco handler update handler' );

                var codeModelValue = ko.utils.unwrapObservable( valueAccessor() );
                var id = element.id;

                ko.monacoEditors.updateEditor( id, codeModelValue );
            };
    }

    // create the editor instance store
    ko.monacoEditors = new MonacoEditorStore();

    // add the created custom binding handler to knockout's handler collection
    ko.bindingHandlers.koMonacoEditor = new MonacoBindingHandlerHelper();

    // ensure that any editor instances get resized upon the window resizing
    window.onresize = function ()
    {
        ko.monacoEditors.resizeAll();
    };
}
