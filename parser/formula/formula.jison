//option parserClass:Formula
/* description: Parses end evaluates mathematical expressions. */
/* lexical grammar */
%lex
%%
\s+									{/* skip whitespace */}
'"'("\\"["]|[^"])*'"'				{return 'STRING';}
"'"('\\'[']|[^'])*"'"				{return 'STRING';}
[A-Za-z]{1,}[A-Za-z_0-9]+(?=[(])    {return 'FUNCTION';}
([0]?[1-9]|1[0-2])[:][0-5][0-9]([:][0-5][0-9])?[ ]?(AM|am|aM|Am|PM|pm|pM|Pm)
									{return 'TIME_AMPM';}
([0]?[0-9]|1[0-9]|2[0-3])[:][0-5][0-9]([:][0-5][0-9])?
									{return 'TIME_24';}
'SHEET'[0-9]+ {
	if (yy.obj.type == 'cell') return 'SHEET';//js
	return 'VARIABLE';//js

	//php if ($this->type == 'cell') return 'SHEET';
	//php return 'VARIABLE';
}
'$'[A-Za-z]+'$'[0-9]+ {
	if (yy.obj.type == 'cell') return 'FIXEDCELL';//js
	return 'VARIABLE';//js

	//php if ($this->type == 'cell') return 'FIXEDCELL';
    //php return 'VARIABLE';
}
[A-Za-z]+[0-9]+ {
	if (yy.obj.type == 'cell') return 'CELL';//js
	return 'VARIABLE';//js

	//php if ($this->type == 'cell') return 'CELL';
    //php return 'VARIABLE';
}
[A-Za-z]+(?=[(])    				{return 'FUNCTION';}
[A-Za-z]{1,}[A-Za-z_0-9]+			{return 'VARIABLE';}
[A-Za-z_]+           				{return 'VARIABLE';}
[0-9]+          			  		{return 'NUMBER';}
"$"									{/* skip whitespace */}
"&"                                 {return '&';}
" "									{return ' ';}
[.]									{return 'DECIMAL';}
":"									{return ':';}
";"									{return ';';}
","									{return ',';}
"*" 								{return '*';}
"/" 								{return '/';}
"-" 								{return '-';}
"+" 								{return '+';}
"^" 								{return '^';}
"(" 								{return '(';}
")" 								{return ')';}
">" 								{return '>';}
"<" 								{return '<';}
"NOT"								{return 'NOT';}
"PI"								{return 'PI';}
"E"									{return 'E';}
'"'									{return '"';}
"'"									{return "'";}
"!"									{return "!";}
"="									{return '=';}
"%"									{return '%';}
[#]									{return '#';}
<<EOF>>								{return 'EOF';}


/lex

/* operator associations and precedence (low-top, high- bottom) */
%left '='
%left '<=' '>=' '<>' 'NOT' '||'
%left '>' '<'
%left '+' '-'
%left '*' '/'
%left '^'
%left '%'
%left UMINUS

%start expressions

%% /* language grammar */

expressions
    : expression EOF {
        return $1;
    }
;

expression
    : variableSequence {
        //js
		    $$ = yy.handler.variable.apply(yy.obj, $1);

        /*php
            $$ = $this->variable($1);
        */
    }
	| TIME_AMPM {
	    //js
            $$ = yy.handler.time.call(yy.obj, $1, true);
        //
    }
	| TIME_24 {
        //js
            $$ = yy.handler.time.call(yy.obj, $1);
        //

    }
	| number {
	    //js
            $$ = yy.handler.number($1);

        /*php
            $$ = $1 * 1;
        */
    }
	| STRING {
        //js
            $$ = $1.substring(1, $1.length - 1);
        /*php
	        $$ = substr($1, 1, -1);
        */
    }
    | expression '&' expression {
        //js
            $$ = $1.toString() + $3.toString();

        /*php
            $$ = $1 . '' . $3;
        */
    }
	| expression '=' expression {
	    //js
            $$ = yy.handler.callFunction.call(yy.obj, 'EQUAL', [$1, $3]);

        /*php
            $$ = $1 == $3;
        */
    }
	| expression '+' expression {
	    //js
			$$ = yy.handler.performMath('+', $1, $3);

        /*php
			if (is_numeric($1) && is_numeric($3)) {
			   $$ = $1 + $3;
			} else {
			   $$ = $1 . $3;
			}
        */
    }
	| '(' expression ')' {
	    //js
	        $$ = yy.handler.number($2);
        //
	}
	| expression '<' '=' expression {
        //js
            $$ = yy.handler.callFunction.call(yy.obj, 'LESS_EQUAL', [$1, $3]);

        /*php
            $$ = ($1 * 1) <= ($4 * 1);
        */
    }
    | expression '>' '=' expression {
        //js
            $$ = yy.handler.callFunction.call(yy.obj, 'GREATER_EQUAL', [$1, $3]);

        /*php
            $$ = ($1 * 1) >= ($4 * 1);
        */
    }
	| expression '<' '>' expression {
        $$ = ($1) != ($4);

        //js
			if (isNaN($$)) {
			    $$ = 0;
			}
        //
    }
	| expression NOT expression {
        $$ = $1 != $3;
    }
	| expression '>' expression {
	    //js
			$$ = yy.handler.callFunction.call(yy.obj, 'GREATER', [$1, $3]);

		/*php
		    $$ = ($1 * 1) > ($3 * 1);
        */
    }
	| expression '<' expression {
        //js
            $$ = yy.handler.callFunction.call(yy.obj, 'LESS', [$1, $3]);

        /*php
            $$ = ($1 * 1) < ($3 * 1);
        */
    }
	| expression '-' expression {
        //js
            $$ = yy.handler.performMath('-', $1, $3);

        /*php
            $$ = ($1 * 1) - ($3 * 1);
        */
    }
	| expression '*' expression {
	    //js
            $$ = yy.handler.performMath('*', $1, $3);

        /*php
            $$ = ($1 * 1) * ($3 * 1);
        */
    }
	| expression '/' expression {
	    //js
            $$ = yy.handler.performMath('/', $1, $3);

        /*php
            $$ = ($1 * 1) / ($3 * 1);
        */
    }
	| expression '^' expression {
        //js
            var n1 = yy.handler.number($1),
                n2 = yy.handler.number($3);

            $$ = yy.handler.performMath('^', $1, $3);

        /*php
            $$ = pow(($1 * 1), ($3 * 1));
        */
    }
	| '-' expression {
		//js
			var n1 = yy.handler.numberInverted($2);
			$$ = n1;
			if (isNaN($$)) {
			    $$ = 0;
			}

        /*php
            $$ = $1 * 1;
        */
		}
	| '+' expression {
	    //js
			var n1 = yy.handler.number($2);
			$$ = n1;
			if (isNaN($$)) {
			    $$ = 0;
			}

        /*php
            $$ = $1 * 1;
        */
		}
	| E {/*$$ = Math.E;*/;}
	| FUNCTION '(' ')' {
	    //js
			$$ = yy.handler.callFunction.call(yy.obj, $1, '');

		/*php
		    $$ = $this->callFunction($1);
        */
    }
	| FUNCTION '(' expseq ')' {
	    //js
			$$ = yy.handler.callFunction.call(yy.obj, $1, $3);

        /*php
            $$ = $this->callFunction($1, $3);
        */
    }
	| cell
	| error
	| error error
;
cell :
	FIXEDCELL {
	    //js
			$$ = yy.handler.fixedCellValue.call(yy.obj, $1);

        /*php
            $$ = $this->fixedCellValue($1);
        */
    }
	| FIXEDCELL ':' FIXEDCELL {
	    //js
           $$ = yy.handler.fixedCellRangeValue.call(yy.obj, $1, $3);

	    /*php
	        $$ = $this->fixedCellRangeValue($1, $3);
        */
    }
	| CELL {
	    //js
			$$ = yy.handler.cellValue.call(yy.obj, $1);
        /*php
            $$ = $this->cellValue($1);
        */
    }
	| CELL ':' CELL {
	    //js
			$$ = yy.handler.cellRangeValue.call(yy.obj, $1, $3);

        /*php
            $$ = $this->cellRangeValue($1, $3);
        */
    }
	| SHEET '!' CELL {
	    //js
			$$ = yy.handler.remoteCellValue.call(yy.obj, $1, $3);
        /*php
            $$ = $this->remoteCellValue($1, $3);
        */
    }
	| SHEET '!' CELL ':' CELL {
	    //js
            $$ = yy.handler.remoteCellRangeValue.call(yy.obj, $1, $3, $5);

        /*php
            $$ = $this->remoteCellRangeValue($1, $3, $5);
        */
    }
;

expseq :
	expression {
	    //js
            $$ = [$1];

        /*php
            $$ = array($1);
        */
    }
	| expseq ';' expression {
	    //js
	        $1.push($3);
	        $$ = $1;

        /*php
            $1[] = $3;
            $$ = $1;
        */
    }
 	| expseq ',' expression {
 	    //js
	        $1.push($3);
	        $$ = $1;

        /*php
			$1[] = $3;
			$$ = $1;
        */
    }
 ;


variableSequence :
	VARIABLE {
        $$ = [$1];
    }
	| variableSequence DECIMAL VARIABLE {
        //js
            $$ = ($.isArray($1) ? $1 : [$1]);
            $$.push($3);

        /*php
            $$ = (is_array($1) ? $1 : array());
            $$[] = $3;
        */
    }
;

number :
	NUMBER {
        $$ = $1;
    }
	| NUMBER DECIMAL NUMBER {
        //js
            $$ = ($1 + '.' + $3) * 1;

        /*php
            $$ = $1 . '.' . $3;
        */
    }
	| number '%' {
        $$ = $1 * 0.01;
    }
;

error :
	'#' VARIABLE '!' {
        $$ = $1 + $2 + $3;
    }
    | VARIABLE '#' VARIABLE '!' {
        $$ = $2 + $3 + $4;
    }
;

%%
if (typeof(window) !== 'undefined') {
	window.Formula = function(handler) {
		var formulaLexer = function () {};
		formulaLexer.prototype = formula.lexer;

		var formulaParser = function () {
			this.lexer = new formulaLexer();
			this.yy = {};
		};

		formulaParser.prototype = formula;
		var newParser = new formulaParser;
		newParser.setObj = function(obj) {
			newParser.yy.obj = obj;
		};
		newParser.yy.handler = handler;
		return newParser;
	};
}