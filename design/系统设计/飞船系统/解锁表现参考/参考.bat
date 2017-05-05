::黑客帝国
@echo %dbg% off 
setlocal ENABLEDELAYEDEXPANSION 
mode con cols=80 lines=30
color 02
set "rainSpeed=0.01"
set /p rainSpeed=请输入播放速度（秒）:
cls
set 退格= 
set redtek=” ”
set end=0
:start
set /a end+=1
call :calc
set /p=!setspaces! nul
set /p=%退格%<NUL
set /p=%redtek:~1,79%<NUL&ECHO.
goto :start
:calc
if %end%==28 (
set /a end=0 & cls & set /a cols=!random:~0,2!
echo … 风力：!cols! … 
if !cols! GTR 76 set cols=76
if !cols! LSS 2 set cols=2
set setspaces=!redtek:~1,%cols%!!random:~0,1!
goto :eof
)
@echo off 
:: test.txt内容为：1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ~`!@#%&*(){}[]_+-=\”‘?.,/ 
:: 暂时不能处理 |<>^ 
mode con cols=80 
color 02 
for /f %%i in (参考.txt) do set str_char=%%i 
set str_blank=  
setlocal enabledelayedexpansion
:loop 
:: 取随机位置上的字符 
set /a num_char=1%random:~-1%%random:~0,1%-100 
set char=!str_char:~-%num_char%,1!
:: 设置随机长度的空格 
set /a num_blank=1%random:~-1%%random:~0,1%-100 
set blank=!str_blank:~0,%num_blank%! 
echo.%blank%%char% 
goto loop
@echo off 
mode con cols=80 
set a=1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ~`!@#%.*(){}[]_+-=\”‘?.,/^&^^^>^< 
set b=  
setlocal enabledelayedexpansion 
:a 
set /a num=%random%%%92 
set 字符=!a:~-%num%,1! 
set/a c=%random%%%80 
set 空格=!b:~-%c%! 
echo %空格%^%字符% 
goto a

@echo off 
mode con cols=80 LINES=30 
set a=1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ~`!@#%.*(){}[]_+-=\”‘?.,/^&^^^>^< 
set b=  
setlocal enabledelayedexpansion 
:a 
set /a num=%random%%%92 
set 字符=!a:~-%num%,1! 
set/a c=%random%%%80 
set 空格=!b:~-%c%! 
::echo. %空格%^%字符%
set/a i+=1 
rem 指针=i 尾指针=j 
set/a j=i-30 
set line%i%=%空格%^%字符% 
FOR /L %%v IN (%i%,-1,%j%) DO echo.!line%%v! 
::ping /n 127.1>nul 
goto a
@echo off 
::mode con cols=80 
setlocal ENABLEDELAYEDEXPANSION 
color 02
goto BEGIN 
goto :eof
::function mt_rand “a” “b” 
:mt_rand 
::( 
set a=%~1 
set b=%~2 
set /a _mt_rand=(!random!%%(%b%-%a%))+%a% 
exit /b 0 
::)
:BEGIN 
::{– 
SET iWidth=80 
SET iDensity=6 
SET sText=”#$&'()*+,-./0123456789:;<>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\]^_`abcdefghijklmnopqrstuvwxyz{|}~ 
SET sText=!sText:”=! 
set /A iText=90-1
for /l %%i in (1,1,%iWidth%) do ( 
set aDown%%i=0 
)
:loop 
for /l %%I in (1,1,%iWidth%) do ( 
set /a aDown%%I-=1 
if !aDown%%I! LSS 0 ( 
call :mt_rand “0” “%iDensity%”&&set aArrow%%I=!_mt_rand! 
call :mt_rand “10” “25”&&set aDown%%I=!_mt_rand! 
) 
if !aArrow%%I! EQU 1 ( 
call :mt_rand “0” “%iText%”&&(FOR %%M IN (“!_mt_rand!”) DO SET aa=!sText:~%%~M,1!) 
set /p=!aa!<NUL 
) else ( 
set /p= <NUL 
) 
) 
ping -n %rainSpeed% 127.1 >nul
goto loop 
::–}
:exit 
exit /b 0
@echo off 
setlocal ENABLEDELAYEDEXPANSION 
color 02
for /l %%i in (1,1,80) do ( 
set Down%%i=0 
)
:loop 
for /l %%j in (1,1,80) do ( 
set /a Down%%j-=1 
if !down%%j! LSS 0 ( 
set /a Arrow%%j=!random!%%4 
set /a Down%%j=!random!%%15+10 
) 
if “!Arrow%%j!” == “1” ( 
set /a chr=!random!%%2 
set /p=!chr!<NUL 
) else ( 
set /p= <NUL 
) 
) 
goto loop 
goto :eof
@echo off  
setlocal ENABLEDELAYEDEXPANSION 
for /l %%i in (1,1,80) do ( 
set Down%%i=0 
)
for /l %%i in (0) do ( 
set line= 
for /l %%j in (1,1,80) do ( 
set /a Down%%j-=1 
call set x=!down%%j! 
if !x! LSS 0 ( 
set /a Arrow%%j=!random!%%6 
set /a Down%%j=!random!%%15+10 
) 
call set x=!Arrow%%j! 
if “!x!” == “1” ( 
set line=!line!1 
) else (set “line=!line! “) 
) 
call set /p=!line!<NUL 
) 