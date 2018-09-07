#include <node.h>
#include <nan.h>
#include <string>
#include "./PlayFileAsyncWorker.cpp"

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
        isolate->ThrowException(v8::Exception::Error(
            v8::String::NewFromUtf8(isolate, "SendInput command failed.")));
    }
}

void PlayFile(const v8::FunctionCallbackInfo<v8::Value> &args)
{
    v8::Isolate *isolate = args.GetIsolate();

    if (args.Length() < 2)
    {
        isolate->ThrowException(v8::Exception::TypeError(
            v8::String::NewFromUtf8(isolate, "3 arguments are required - path to a file to play, volume and callback.")));
        return;
    }

    if (!args[0]->IsString())
    {
        isolate->ThrowException(v8::Exception::TypeError(
            v8::String::NewFromUtf8(isolate, "First argument must be a string.")));
        return;
    }

    if (!args[1]->IsNumber())
    {
        isolate->ThrowException(v8::Exception::TypeError(
            v8::String::NewFromUtf8(isolate, "Second argument must be a number.")));
        return;
    }

    if (!args[2]->IsFunction())
    {
        return Nan::ThrowError(Nan::New("Third argument must be a function callback.").ToLocalChecked());
    }

    Nan::Utf8String nan_string(args[0]->ToString());
    const string filePath = string(*nan_string);
    const int volume = (int)args[1]->NumberValue();
    Nan::Callback *nanCallback = new Nan::Callback(args[2].As<v8::Function>());

    Nan::AsyncQueueWorker(new PlayFileAsyncWorker(filePath, volume, nanCallback));
}

void Initialize(v8::Local<v8::Object> exports)
{
    NODE_SET_METHOD(exports, "broadcastCopyCommand", BroadcastCopyCommand);
    NODE_SET_METHOD(exports, "playFile", PlayFile);
}

NODE_MODULE(module_name, Initialize)