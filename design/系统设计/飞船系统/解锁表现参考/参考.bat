::�ڿ͵۹�
@echo %dbg% off 
setlocal ENABLEDELAYEDEXPANSION 
mode con cols=80 lines=30
color 02
set "rainSpeed=0.01"
set /p rainSpeed=�����벥���ٶȣ��룩:
cls
set �˸�= 
set redtek=�� ��
set end=0
:start
set /a end+=1
call :calc
set /p=!setspaces! nul
set /p=%�˸�%<NUL
set /p=%redtek:~1,79%<NUL&ECHO.
goto :start
:calc
if %end%==28 (
set /a end=0 & cls & set /a cols=!random:~0,2!
echo �� ������!cols! �� 
if !cols! GTR 76 set cols=76
if !cols! LSS 2 set cols=2
set setspaces=!redtek:~1,%cols%!!random:~0,1!
goto :eof
)
@echo off 
:: test.txt����Ϊ��1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ~`!@#%&*(){}[]_+-=\����?.,/ 
:: ��ʱ���ܴ��� |<>^ 
mode con cols=80 
color 02 
for /f %%i in (�ο�.txt) do set str_char=%%i 
set str_blank=  
setlocal enabledelayedexpansion
:loop 
:: ȡ���λ���ϵ��ַ� 
set /a num_char=1%random:~-1%%random:~0,1%-100 
set char=!str_char:~-%num_char%,1!
:: ����������ȵĿո� 
set /a num_blank=1%random:~-1%%random:~0,1%-100 
set blank=!str_blank:~0,%num_blank%! 
echo.%blank%%char% 
goto loop
@echo off 
mode con cols=80 
set a=1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ~`!@#%.*(){}[]_+-=\����?.,/^&^^^>^< 
set b=  
setlocal enabledelayedexpansion 
:a 
set /a num=%random%%%92 
set �ַ�=!a:~-%num%,1! 
set/a c=%random%%%80 
set �ո�=!b:~-%c%! 
echo %�ո�%^%�ַ�% 
goto a

@echo off 
mode con cols=80 LINES=30 
set a=1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ~`!@#%.*(){}[]_+-=\����?.,/^&^^^>^< 
set b=  
setlocal enabledelayedexpansion 
:a 
set /a num=%random%%%92 
set �ַ�=!a:~-%num%,1! 
set/a c=%random%%%80 
set �ո�=!b:~-%c%! 
::echo. %�ո�%^%�ַ�%
set/a i+=1 
rem ָ��=i βָ��=j 
set/a j=i-30 
set line%i%=%�ո�%^%�ַ�% 
FOR /L %%v IN (%i%,-1,%j%) DO echo.!line%%v! 
::ping /n 127.1>nul 
goto a
@echo off 
::mode con cols=80 
setlocal ENABLEDELAYEDEXPANSION 
color 02
goto BEGIN 
goto :eof
::function mt_rand ��a�� ��b�� 
:mt_rand 
::( 
set a=%~1 
set b=%~2 
set /a _mt_rand=(!random!%%(%b%-%a%))+%a% 
exit /b 0 
::)
:BEGIN 
::{�C 
SET iWidth=80 
SET iDensity=6 
SET sText=��#$&'()*+,-./0123456789:;<>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\]^_`abcdefghijklmnopqrstuvwxyz{|}~ 
SET sText=!sText:��=! 
set /A iText=90-1
for /l %%i in (1,1,%iWidth%) do ( 
set aDown%%i=0 
)
:loop 
for /l %%I in (1,1,%iWidth%) do ( 
set /a aDown%%I-=1 
if !aDown%%I! LSS 0 ( 
call :mt_rand ��0�� ��%iDensity%��&&set aArrow%%I=!_mt_rand! 
call :mt_rand ��10�� ��25��&&set aDown%%I=!_mt_rand! 
) 
if !aArrow%%I! EQU 1 ( 
call :mt_rand ��0�� ��%iText%��&&(FOR %%M IN (��!_mt_rand!��) DO SET aa=!sText:~%%~M,1!) 
set /p=!aa!<NUL 
) else ( 
set /p= <NUL 
) 
) 
ping -n %rainSpeed% 127.1 >nul
goto loop 
::�C}
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
if ��!Arrow%%j!�� == ��1�� ( 
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
if ��!x!�� == ��1�� ( 
set line=!line!1 
) else (set ��line=!line! ��) 
) 
call set /p=!line!<NUL 
) 