export class BrowserMediaDevice {
    static readonly KIND_AUDIO_INPUT: string = 'audioinput';
    static readonly KIND_AUDIO_OUTPUT: string = 'audiooutput';
    static readonly KIND_VIDEO_INPUT: string = 'videoinput';

    private currentAudioInput?: MediaDeviceInfo;
    private currentVideoInput?: MediaDeviceInfo;
    private currentAudioOutput?: MediaDeviceInfo;
    private deviceList?: MediaDeviceInfo[];

    reset(): void {
        this.deviceList = undefined;
    }

    private getDeviceListPromise(): Promise<MediaDeviceInfo[]> {
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
            return Promise.reject('enumerateDevices() not supported.');
        }

        if (this.deviceList) {
            return Promise.resolve(this.deviceList);
        }

        return navigator.mediaDevices
            .enumerateDevices()
            .then(devices => {
                this.deviceList = devices;
                return this.deviceList;
            });
    }

    private getMediaDevicesByKind(kind: string): Promise<MediaDeviceInfo[]> {
        return this.getDeviceListPromise()
            .then(devices => {
                // tslint:disable-next-line: triple-equals
                return devices.filter(device => device.kind == kind);
            });
    }

    getAudioInputList(): Promise<MediaDeviceInfo[]> {
        return this.getMediaDevicesByKind(BrowserMediaDevice.KIND_AUDIO_INPUT);
    }

    getAudioOutputList(): Promise<MediaDeviceInfo[]> {
        return this.getMediaDevicesByKind(BrowserMediaDevice.KIND_AUDIO_OUTPUT);
    }

    getVideoInputList(): Promise<MediaDeviceInfo[]> {
        return this.getMediaDevicesByKind(BrowserMediaDevice.KIND_VIDEO_INPUT);
    }

    getCurrentAudioInput(): MediaDeviceInfo | undefined {
        return this.currentAudioInput;
    }

    getCurrentAudioOutput(): MediaDeviceInfo | undefined {
        return this.currentAudioOutput;
    }

    getCurrentVideoInput(): MediaDeviceInfo | undefined {
        return this.currentVideoInput;
    }

    setAudioInput(device: MediaDeviceInfo): void {
        this.currentAudioInput = device;
    }

    setAudioOutput(device: MediaDeviceInfo): void {
        this.currentAudioOutput = device;
    }

    setVideoInput(device: MediaDeviceInfo): void {
        this.currentVideoInput = device;
    }

    private createMediaTrackConstraint(device?: MediaDeviceInfo): MediaTrackConstraints | undefined {
        if (!device) {
            return undefined;
        }

        return Object.assign({}, device, {
            deviceId: {
                exact: device.deviceId
            }
        });
    }

    private isConstraintDisabled(constraint: MediaStreamConstraints, key: string): boolean {
        return constraint.hasOwnProperty(key) && constraint[key] === false;
    }

    getDeviceConstraints(initialConstraints?: MediaStreamConstraints): MediaStreamConstraints {
        const audioConstraint = this.createMediaTrackConstraint(this.getCurrentAudioInput());
        const videoConstraint = this.createMediaTrackConstraint(this.getCurrentVideoInput());

        if (!initialConstraints) {
            return {
                audio: audioConstraint,
                video: videoConstraint
            };
        }

        return Object.assign({}, initialConstraints, {
            audio: this.isConstraintDisabled(initialConstraints, 'audio') ? false : audioConstraint,
            video: this.isConstraintDisabled(initialConstraints, 'video') ? false : videoConstraint
        });
    }
}
