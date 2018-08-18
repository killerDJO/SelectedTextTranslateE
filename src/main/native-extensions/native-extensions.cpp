#include <node.h>
#include <nan.h>
#include <string>

using namespace std;

#define AUDIO_FILE_NAME "STT_audio"

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

void CheckMCIError(MCIERROR errorCode, v8::Isolate *isolate)
{
    if (errorCode != 0)
    {
        const int ErrorDescriptionLength = 256;
        char errorDescription[ErrorDescriptionLength];
        mciGetErrorStringA(errorCode, errorDescription, ErrorDescriptionLength);
        isolate->ThrowException(v8::Exception::TypeError(
            v8::String::NewFromUtf8(isolate, string(errorDescription).c_str())));
    }
}

void PlayFile(const v8::FunctionCallbackInfo<v8::Value> &args)
{
    v8::Isolate *isolate = args.GetIsolate();

    if (args.Length() < 1)
    {
        isolate->ThrowException(v8::Exception::TypeError(
            v8::String::NewFromUtf8(isolate, "At least one argument is required - path to a file to play.")));
        return;
    }

    if (!args[0]->IsString())
    {
        isolate->ThrowException(v8::Exception::TypeError(
            v8::String::NewFromUtf8(isolate, "First argument must be a string.")));
        return;
    }

    Nan::Utf8String nan_string(args[0]->ToString());
    const string filePath = string(*nan_string);

    const string openFileCommand = "open " + filePath + " type mpegvideo alias " + string(AUDIO_FILE_NAME);
    CheckMCIError(mciSendStringA(openFileCommand.c_str(), nullptr, 0, nullptr), isolate);

    const string playAudioCommand = "play " + string(AUDIO_FILE_NAME) + " wait";
    CheckMCIError(mciSendStringA(playAudioCommand.c_str(), nullptr, 0, nullptr), isolate);

    const string closeAudioCommand = "close " + string(AUDIO_FILE_NAME);
    CheckMCIError(mciSendStringA(closeAudioCommand.c_str(), nullptr, 0, nullptr), isolate);
}

void Initialize(v8::Local<v8::Object> exports)
{
    NODE_SET_METHOD(exports, "broadcastCopyCommand", BroadcastCopyCommand);
    NODE_SET_METHOD(exports, "playFile", PlayFile);
}

NODE_MODULE(module_name, Initialize)