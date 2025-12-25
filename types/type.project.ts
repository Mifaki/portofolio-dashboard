import type { GeneralStatusEnum } from './type.general';

export interface IRootProject {
	id: string;
	name: string;
	desc: string;
	status: GeneralStatusEnum;
}
