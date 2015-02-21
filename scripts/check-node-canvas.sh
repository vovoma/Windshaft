#!/bin/sh

if [[ "$OSTYPE" == "darwin"* ]]; then
    CAIRO_PKG_CONFIG=`pkg-config cairo --cflags-only-I 2> /dev/null`
    RESULT=$?

    if [[ ${RESULT} -ne 0 ]]; then
        echo "###################################################################################"
        echo "#                            PREINSTALL HOOK ERROR                                #"
        echo "#---------------------------------------------------------------------------------#"
        echo "#                                                                                 #"
        echo "# node-canvas install error: some packages required by 'cairo' are not found      #"
        echo "# Try to 'export PKG_CONFIG_PATH=/usr/local/lib/pkgconfig:/opt/X11/lib/pkgconfig' #"
        echo "#                                                                                 #"
        echo "# If problems persist visit: https://github.com/Automattic/node-canvas/wiki       #"
        echo "#                                                                                 #"
        echo "###################################################################################"
        exit 1
    fi
fi
