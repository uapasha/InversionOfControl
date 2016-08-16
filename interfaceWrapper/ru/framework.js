// Пример оборачивания функции в песочнице

var fs = require('fs'),
    vm = require('vm');

var cloneInterface = function (interface) {
  var clone = {};
  for (var key in interface){
    clone[key] = interface[key]
  }
  return clone;
}

var wrapFunction = function(fnName, fn){
  return function wrap(...args){
    console.log('Call: ' + fnName);
    console.dir(args);
    console.log()
    if(typeof args[args.length-1] === 'function'){
      var callback = args.pop()
      var newCallback = function(...args){
        console.log('callback was called');
        callback(...args);
      }
      args.push(newCallback);
    }
    return fn.apply(undefined, args);
  }
}

var wrappedFs = cloneInterface(fs);

for (var key in wrappedFs){
  wrappedFs[key] = wrapFunction(wrappedFs[key].name, wrappedFs[key])
}


// Объявляем хеш из которого сделаем контекст-песочницу
var context = {
  module: {},
  console: console,
  // Помещаем ссылку на fs API в песочницу
  fs: wrappedFs,
};

// Преобразовываем хеш в контекст
context.global = context;
var sandbox = vm.createContext(context);

// Читаем исходный код приложения из файла
var fileName = './application.js';
fs.readFile(fileName, function(err, src) {
  // Запускаем код приложения в песочнице
  var script = vm.createScript(src, fileName);
  script.runInNewContext(sandbox);
});
