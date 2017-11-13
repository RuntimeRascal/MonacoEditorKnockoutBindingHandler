/*!
 * @file
 * typescript global type definitions 
 *
 * @summary   extends KnockoutStatic type and declares a global Require function
 *
 * link:      http://simperfactory.visualstudio.com/_git/NWJS-AdobeCEP/app/scripts/moncaoEditorBindinghanlder.ts
 *            https://stackoverflow.com/questions/16204142/how-do-i-define-a-knockout-binding-handler-in-typescript
 * 
 * Author:    TSimper
 * Created:   2017-10-22 at 4:22 PM
 * Name:      moncaoEditorBindinghanlder.ts
 *
 * Copyright (c) 2017 SimperFactory
 */


/**
 * extend the Knockout.KnockoutBindingHandlers namespace
 * @interface KnockoutBindingHandlers
 */
interface KnockoutBindingHandlers
{
    /**
     * custom knockout binding handler to create monaco code editor instances and bind code editing value to a 
     * knockout observable property in view model. Also, this custom binding handler allows for a rich editor
     * configuration via the binding with the meOptions object literal.
     * 
     * @type {KnockoutBindingHandler}
     * @memberof KnockoutBindingHandlers
     */
    koMonacoEditor: KnockoutBindingHandler;
}

/**
 * extend the Knockout.KnockoutStatic namespace
 * @interface KnockoutStatic
 */
interface KnockoutStatic
{
    /**
     * utility to hook into the knockout namespace and store a colletion of monaco editor instance reference
     * 
     * @type {my.IMonacoEditorsStore}
     * @memberof KnockoutStatic
     */
    monacoEditors: my.IMonacoEditorsStore;
}

declare var require: ( ...args: any[] ) => any;