#include <node.h>
#include <nan.h>
#include <string>

using namespace std;

class PlayFileAsyncWorker : public Nan::AsyncWorker
{
  public:
    string filePath;

    PlayFileAsyncWorker(string filePath, Nan::Callback *callback)
        : Nan::AsyncWorker(callback)
    {
        this->filePath = filePath;
    }

    void Execute()
    {
        const string AUDIO_FILE_NAME = "STT_audio";
        const string openFileCommand = "open " + filePath + " type mpegvideo alias " + AUDIO_FILE_NAME;
        CheckMCIError(mciSendStringA(openFileCommand.c_str(), nullptr, 0, nullptr));

        const string playAudioCommand = "play " + AUDIO_FILE_NAME + " wait";
        CheckMCIError(mciSendStringA(playAudioCommand.c_str(), nullptr, 0, nullptr));

        const string closeAudioCommand = "close " + AUDIO_FILE_NAME;
        CheckMCIError(mciSendStringA(closeAudioCommand.c_str(), nullptr, 0, nullptr));
    }

    void HandleOKCallback()
    {
        Nan::HandleScope scope;
        v8::Local<v8::Value> argv[] = {Nan::Null()};
        Nan::Call(callback->GetFunction(), Nan::GetCurrentContext()->Global(), 1, argv);
    }

    void HandleErrorCallback()
    {
        Nan::HandleScope scope;
        v8::Local<v8::Value> argv[] = {Nan::New(this->ErrorMessage()).ToLocalChecked()};
        Nan::Call(callback->GetFunction(), Nan::GetCurrentContext()->Global(), 1, argv);
    }

  private:
    void CheckMCIError(MCIERROR errorCode)
    {
        if (errorCode != 0)
        {
            const int ErrorDescriptionLength = 256;
            char errorDescription[ErrorDescriptionLength];
            mciGetErrorStringA(errorCode, errorDescription, ErrorDescriptionLength);
            SetErrorMessage(string(errorDescription).c_str());
        }
    }
};