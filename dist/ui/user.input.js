"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInput = void 0;
function createInput(props) {
    var input = window.document.createElement("input");
    input.placeholder = "Enter your message";
    input.type = "text";
    input.style.width = "100%";
    return input;
}
exports.createInput = createInput;
