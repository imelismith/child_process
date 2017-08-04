'use strict';

/**
 * ============================================================================
 *                                   (/^▽^)/
 *                            Node.js Child Processes
 * ============================================================================
*/

/**
 *      Using 'multiple processes' is the best way to scale a Node application. 
 *      Node.js is designed for building distributed applications with many nodes.
 *      This is why it’s named 'Node'. Scalability is ingrained into the platform and 
 *      it’s not something you start thinking about later in the lifetime of an application.
 * 
 */

/**
 * ============================================================================
 *                                   (/^▽^)/
 *                          The Child Processes Module
 * ============================================================================
*/

/**
 *      We can easily spin a child process using Node’s 'child_process' module 
 *      and those child processes can easily communicate with each other with a 'messaging' system.
 *      
 *      The 'child_process' module enables us to access Operating System functionalities by running 
 *      any system command inside a, well, child process.
 * 
 *      We can control that child process input stream, and listen to its output stream.
 *      We can also control the arguments to be passed to the underlying OS command,
 *      and we can do whatever we want with that command’s output.
 * 
 *      There are four different ways to create a child process in Node: 'spawn()', 'fork()', 'exec()', and 'execFile()'.
 * 
 */

/**
 * ============================================================================
 *                                   (/^▽^)/
 *                           Spawned Child Processes
 * ============================================================================
*/

// The 'spawn()' function launches a command in a new process and we can use it to pass that command any arguments.
// For example, here’s code to spawn a new process that will execute the 'pwd' command.
const spawn = require('child_process').spawn;

const child = spawn('pwd'); // print working directory

// we can register handlers for events on this child object directly. For example, we can do something 
// when the child process exits by registering a handler for the exit event:
child.on('exit', function (code, signal) {
  console.log('child process exited with ' +
              `code ${code} and signal ${signal}`);
});

/**
 *      The other events that we can register handlers for with the ChildProcess instances are
 *      'disconnect', 'error', 'close', and 'message'.
 * 
 *      The 'disconnect' event is emitted when the parent process manually calls the child.disconnect function.
 *      The 'error' event is emitted if the process could not be spawned or killed.
 *      The 'close' event is emitted when the stdio streams of a child process get closed.
 * 
 *      The 'message' event is the most important one. It’s emitted when the child process uses the 'process.send()'
 *      function to send messages. This is how parent/child processes can communicate with each other.
 * 
 *      Every child process also gets the three standard 'stdio' streams,
 *      which we can access using 'child.stdin', 'child.stdout', and 'child.stderr'.
 * 
 *      Unlike in a normal process though, in a child process, the 'stdout/stderr' streams
 *      are readable streams while the 'stdin' stream is a 'writable' one.
 *      
 *      Most importantly, on the readable streams, we can listen to the 'data' event, which will have
 *      the output of the command or any error encountered while executing the command:
 */

child.stdout.on('data', (data) => {
  console.log(`child stdout:\n${data}`);
});

child.stderr.on('data', (data) => {
  console.error(`child stderr:\n${data}`);
});

/**
 *      We can pass arguments to the command that’s executed by the spawn function using the second argument of
 *      the spawn function, which is an array of all the arguments to be passed to the command.
 * 
 *      For example, to execute the 'find' command on the current directory with
 *      a -type f argument (to list files only), we can do:
 */

const child = spawn('find', ['.', '-type', 'f']);

/**
 *      B/c the 'stdin' is a writable stream, we can use it to send a command some input.
 *      Since the Main Process 'stdin' is a readable stream, we can pipe that into a child
 *      process 'stdin' stream:
 */

const child = spawn('wc'); // 'wc' module counts lines, words, and chars (Linux)

process.stdin.pipe(child.stdin);

child.stdout.on('data', (data) => {
  console.log(`child stdout:\n${data}`);
});

/**
 *      The result of the above combination is that we get a standard input mode where we can type something
 *      and when we hit 'Ctrl+D', what we typed will be used as the input of the 'wc' command.
 * 
 *      We can also pipe the standard input/output of multiple processes on 'each other,' just like we can do with
 *      Linux commands.
 * 
 *      For example, we can pipe the stdout of the 'find' command to the stdin of the 'wc' command to count all
 *      the files in the current directory.
 * 
 *      When executed, the code BELOW will output a count of all files in all directories under the current one:
 */

const find = spawn('find', ['.', '-type', 'f']);
const wc = spawn('wc', ['-l']); // '-l' arg counts only the lines

find.stdout.pipe(wc.stdin);

wc.stdout.on('data', (data) => {
  console.log(`Number of files ${data}`);
});

/**
 * ============================================================================
 *                                   (/^▽^)/
 *                     Shell Syntax and the exec() function
 * ============================================================================
*/

/**
 *      The 'spawn' function does NOT create a shell to execute the command we pass into it.
 *      This makes it slightly more efficient than the 'exec()' function, which does create a shell.
 * 
 *      The 'exec' function has one other major difference. It 'buffers' the command’s generated output
 *      and passes the whole output value to a callback function (instead of using streams, which is what spawn does).
 * 
 *      Here’s the previous 'find | wc' example implemented with an exec function:
 */

const { exec } = require('child_process');

exec('find . -type f | wc -l', (err, stdout, stderr) => {
  if (err) {
    console.error(`exec error: ${err}`);
    return;
  }

  console.log(`Number of files ${stdout}`);
});

/**
 *      Since the 'exec()' function uses a shell to execute the command,
 *      we can use the shell syntax directly here making use of the shell pipe feature.
 * 
 *      Note: Using the shell syntax comes at a 'security risk' if you’re executing 
 *      any kind of dynamic input provided externally. A user can simply do a command injection attack.
 * 
 *      The 'exec()' function is a good choice if you NEED to use the shell syntax and if the size of the
 *      data expected from the command is SMALL. (Remember, exec will buffer the whole data in memory before returning it.)
 * 
 *      The 'spawn()' function is a much better choice when the size of the data expected from the command is LARGE,
 *      because that data will be streamed with the standard IO objects.
 * 
 *      The spawned child process inherits the standard IO objects of its parents if we want to, but also, more importantly, we can make
 *      the spawn function use the shell syntax as well. Here’s the same 'find | wc' command implemented with the spawn function:
 */

const child = spawn('find . -type f', {
  stdio: 'inherit',
  shell: true
});

/**
 *      B/c the stdio: 'inherit' option above, when we execute the code, the child process inherits the main process stdin, stdout, and stderr.
 *      We still get the advantage of the streaming of data that the 'spawn()' function gives us, really the best of both worlds!
 * 
 *      There are a few other good options we can use in the last argument to the 'child_process' functions besides shell and stdio. We can,
 *      for example, use the 'cwd' option to change the working directory of the script. For example, here’s the same count-all-files example
 *      done with a 'spawn()' function using a shell and with a working directory set to my Downloads folder. The cwd option here will make the
 *      script count all files I have in ~/Downloads:
 */

const child = spawn('find . -type f | wc -l', {
  stdio: 'inherit',
  shell: true,
  cwd: '/Users/name/Downloads'
});

/**
 *      Another option we can use is the 'env' option to specify the environment variables that will be visible to the new child process.
 *      The default for this option is 'process.env' which gives any command access to the current process environment.
 *      If we want to override that behavior, we can simply pass an empty object as the env option or new values there to
 *      be considered as the only environment variables:
 */

const child = spawn('echo $ANSWER', {
  stdio: 'inherit',
  shell: true,
  env: { ANSWER: 23 },
});

/**
 *      The 'echo' command above does not have access to the parent process’s environment variables. It can’t, for example, access $HOME,
 *      but it can access '$ANSWER' because it was passed as a custom environment variable through the 'env' option.
 * 
 *      One last important child process option to explain here is the 'detached' option, which makes the child process run independently of its parent process.
 *      Assuming we have a file 'timer.js' that keeps the event loop busy:
 */

setTimeout(() => {  
  // keep the event loop busy
}, 50000);

// We can execute it in the background using the 'detached' option:
const child = spawn('node', ['timer.js'], {
  detached: true,
  stdio: 'ignore'
});

child.unref();

/**
 *      The 'unref()' function above is called on the detached process, meaning the parent process can exit independently of the child.
 *      This can be useful if the child is executing a long-running process, but to keep it running in the background the
 *      child’s stdio configurations also have to be independent of the parent.
 * 
 *      The example above will run a node script (timer.js) in the background by detaching and also ignoring its
 *      parent stdio file descriptors so that the parent can terminate while the child keeps running in the background.
 */


/**
 * ============================================================================
 *                                   (/^▽^)/
 *                            The execFile Function
 * ============================================================================
*/

/**
 *      If you need to execute a file without using a shell, the 'execFile()' function is what you need. It behaves exactly like the 'exec()' function,
 *      but does not use a shell, which makes it a bit more efficient.
 * 
 *      On Windows, some files cannot be executed on their own, like '.bat' or '.cmd' files. Those files cannot be executed with 
 *      'execFile()' and either 'exec()' or 'spawn()' with shell set to true is required to execute them.
 */

/**
 * ============================================================================
 *                                   (/^▽^)/
 *                              The *Sync Function
 * ============================================================================
*/

// The functions spawn, exec, and execFile from the child_process module also have synchronous blocking versions 
// that will wait until the child process exits.
const { 
  spawnSync, 
  execSync, 
  execFileSync,
} = require('child_process');

/**
 * ============================================================================
 *                                   (/^▽^)/
 *                              The Fork Function
 * ============================================================================
*/

/**
 *      The 'fork()' function is a variation of the 'spawn()' function for spawning node processes. The biggest difference
 *      between spawn and fork is that a 'communication channel' is established to the child process when using fork.
 * 
 *      We can then use the 'send()' function on the forked process along with the global 'process object' itself to exchange
 *      messages between the parent and forked processes.
 * 
 *      The parent file, parent.js:
 */

const { fork } = require('child_process');

const forked = fork('child.js');

forked.on('message', (msg) => {
  console.log('Message from child', msg);
});

forked.send({ hello: 'world' });

// The child file, child.js:
process.on('message', (msg) => {
  console.log('Message from parent:', msg);
});

let counter = 0;

setInterval(() => {
  process.send({ counter: counter++ });
}, 4000);

/**
 *      In the parent file above, we fork child.js (which will execute the file with the node command) and then we listen for the 'message 'event.
 *      The message event will be emitted whenever the child uses 'process.send', which we’re doing every four seconds.
 * 
 *      To pass down messages from the 'parent to the child', we can execute the 'send' function on the forked object itself, and then,
 *      in the child script, we can listen to the message event on the 'global process object'.
 *      
 *      When executing the parent.js file above, it’ll first send down the { hello: 'world' } object to be printed by the forked child process
 *      and then the forked child process will send an incremented counter value every second to be printed by the parent process.
 */


// ============================  PRACTICAL EXAMPLE  ================================================

// Let’s say we have an 'http server' that handles two endpoints. One of these endpoints (/compute below) is computationally expensive 
// and will take a few seconds to complete. We can use a long for loop to simulate that:
const http = require('http');

const longComputation = () => {
  let sum = 0;
  for (let i = 0; i < 1e9; i++) {
    sum += i;
  };
  return sum;
};

const server = http.createServer();

server.on('request', (req, res) => {
  if (req.url === '/compute') {
    const sum = longComputation();
    return res.end(`Sum is ${sum}`);
  } else {
    res.end('Ok')
  }
});

server.listen(3000);

/**
 *      The above program has a big problem, when the the /compute endpoint is requested, the server will not be able
 *      to handle any other requests because the event loop is busy with the long for loop operation.
 * 
 *      One solution that works for all operations is to just move the computational operation into another process using 'fork()'.
 *      
 *      We first move the whole longComputation function into its own file and make it invoke that function when 
 *      instructed via a message from the main process:
 *      
 *      In a new compute.js file:
 */
const longComputation = () => {
  let sum = 0;
  for (let i = 0; i < 1e9; i++) {
    sum += i;
  };
  return sum;
};

process.on('message', (msg) => {
  const sum = longComputation();
  process.send(sum);
});

// Now, instead of doing the long operation in the 'main process event loop', we can 'fork()' the compute.js file and use 
// the messages interface to communicate messages between the server and the forked process.
const server = http.createServer();

server.on('request', (req, res) => {
  if (req.url === '/compute') {
    const compute = fork('compute.js');
    compute.send('start');
    compute.on('message', sum => {
      res.end(`Sum is ${sum}`);
    });
  } else {
    res.end('Ok')
  }
});

server.listen(3000);

/**
 *      When a request to /compute happens now with the above code, we simply send a message to the forked process to start executing
 *      the long operation. The main process’s event loop will not be blocked.
 *      
 *      Once the forked process is done with that long operation, it can send its result back to the parent process using 'process.send'.
 *      
 *      In the parent process, we listen to the 'message' event on the forked child process itself. When we get that event, we’ll have a
 *      sum value ready for us to send to the requesting user over http.
 */
