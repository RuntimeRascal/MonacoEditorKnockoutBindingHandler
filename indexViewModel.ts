
/// <reference path="knockout.d.ts" />
/// <reference path="jquery.d.ts" />

module my
{
    class IndexViewModel
    {
        mainEditorText: KnockoutObservable<string> = ko.observable( '' );
        constructor ( editorText?: string )
        {
            if ( editorText !== null )
                this.mainEditorText( editorText );
            else
                this.mainEditorText( '// start coding' );
        }

        evalCode ()
        {
            let code = this.mainEditorText();

            try
            {
                eval( code );
            }
            catch ( error )
            {
                console.log( error );
            }
        }
    }

    $( () =>
    {
        let defaultJavascript = [
            '// default javascript and example use of monaco-editor and knockout',
            '',
            'let testVar = "n/a";',
            'var testVar2 = "n/a";',
            '',
            'function print( message ){',
            '   alert( message );',
            '}',
            '',
            'print( testVar );',
            'print( testVar2 );',
            ''
        ].join( '\n' );
        ko.applyBindings( new IndexViewModel( defaultJavascript ) );
    } );
}