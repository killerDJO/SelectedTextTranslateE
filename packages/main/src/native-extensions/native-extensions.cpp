#include <node.h>
#include <nan.h>
#include <string>

using namespace std;

void BroadcastCopyCommand(const v8::FunctionCallbackInfo<v8::Value> &args)
{
    v8::Isolate *isolate = args.GetIsolate();

    int key_count = 4;
    INPUT *input = new INPUT[key_count];
    for (int i = 0; i < key_count; i++)
    {
        input[i].ki.dwFlags = 0;
        input[i].type = INPUT_KEYBOARD;
    }

    input[0].ki.wVk = VK_CONTROL;
    input[0].ki.wScan = MapVirtualKey(VK_CONTROL, MAPVK_VK_TO_VSC);
    input[1].ki.wVk = 0x43;
    input[1].ki.wScan = MapVirtualKey(0x43, MAPVK_VK_TO_VSC);
    input[2].ki.dwFlags = KEYEVENTF_KEYUP;
    input[2].ki.wVk = input[0].ki.wVk;
    input[2].ki.wScan = input[0].ki.wScan;
    input[3].ki.dwFlags = KEYEVENTF_KEYUP;
    input[3].ki.wVk = input[1].ki.wVk;
    input[3].ki.wScan = input[1].ki.wScan;

    if (!SendInput(key_count, LPINPUT(input), sizeof(INPUT)))
    {
        v8::Local<v8::String> errorMessage;
        v8::String::NewFromUtf8(isolate, "SendInput command failed.").ToLocal(&errorMessage);
        isolate->ThrowException(v8::Exception::Error(errorMessage));
    }
}

void Initialize(v8::Local<v8::Object> exports)
{
    NODE_SET_METHOD(exports, "broadcastCopyCommand", BroadcastCopyCommand);
}

NODE_MODULE(module_name, Initialize)