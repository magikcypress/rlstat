# RLstat

Beautiful RealTime Graph is a nodejs application (quick & dirty style code inside)
Read and display information for the linux system with nodejs

work on GNU/Linux system (require /proc/diskstats)

# Installation

install node.js v0.6.13 and npm

    // install node
    git clone clone git://github.com/joyent/node.git
    cd node/
    git checkout v0.6.13
    ./configure && make && make install
    // then install npm
    curl http://npmjs.org/install.sh | sh

install the required npm modules

    cd rlstat
    npm install (this installs the deps defined in `/package.json`)
