fs = require('fs');

/* This indents to read and parse /proc/stat
 * cpustats is an array of string that should match
 */
exports.linux_get_cpustats = function linux_get_cpustats(cpus)
{
    var raw;
    var lines;
    var cpustats = {};
    try {
        raw = fs.readFileSync('/proc/stat', 'ascii');
    } catch (e) {
        console.error("Unable to read /proc/stat. Are you running Linux ?");
        return null;
    }

    lines = raw.split("\n");
    for (var lineid in lines)
    {
        var line = lines[lineid];
        if (! line)
            break;
        var ar = line.split(/\s+/);

        for (var i in cpus)
        {
            if (cpus[i] == ar[0])
            {
                cpustats[ar[0]] = {
                    "user": ar[1],
                    "nice": ar[2],
                    "system": ar[3],
                    "idle": ar[4],
                    "iowait": ar[5],
                    "irq": ar[6],
                    "softirq": ar[7],
                };
            }
        }
    }

    return cpustats;
}
