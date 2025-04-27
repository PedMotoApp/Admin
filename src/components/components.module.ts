import { NgModule } from '@angular/core';
import { WorkRunOneComponent } from './work-run-one/work-run-one';
import { WorkRunTwoComponent } from './work-run-two/work-run-two';
import { WorkRunThreeComponent } from './work-run-three/work-run-three';
import { WorkRunFourComponent } from './work-run-four/work-run-four';

@NgModule({
	declarations: [
    WorkRunOneComponent,
    WorkRunTwoComponent,
    WorkRunThreeComponent,
    WorkRunFourComponent,
   ],

	imports: [],
	exports: [WorkRunOneComponent,
    WorkRunTwoComponent,
    WorkRunThreeComponent,
    WorkRunFourComponent,
   ]
})
export class ComponentsModule {}
