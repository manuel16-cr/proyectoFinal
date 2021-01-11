import { Component, OnInit } from '@angular/core';
import { NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FirebaseServiceService } from './../services/firebase-service.service';
import { isNull } from '@angular/compiler/src/output/output_ast';
import { isNullOrUndefined } from 'util';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  closeResult = '';

  autoForm: FormGroup;

  idFirebaseActualizar: string;
  actualizar: boolean;

  constructor(private modalService: NgbModal,
    public fb: FormBuilder,
    private firebaseServiceService: FirebaseServiceService
    ) { }

  config: any;
  collection = { count: 20, data: []}

  ngOnInit(): void {

    this.idFirebaseActualizar = "";
    this.actualizar = false;

    this.config = {
      itemsPerPage: 5,
      currentPage: 1,
      totalItems: this.collection.count
    };

    this.autoForm = this.fb.group({
      id: ['', Validators.required],
      marca: ['', Validators.required],
      modelo: ['', Validators.required],
      anio: ['', Validators.required],
      precio: ['', Validators.required]
    });

    this.firebaseServiceService.getAutos().subscribe(resp => {
      this.collection.data = resp.map((e: any) => {
        return{
        id: e.payload.doc.data().id,
        marca: e.payload.doc.data().marca,
        modelo: e.payload.doc.data().modelo,
        anio: e.payload.doc.data().anio,
        precio: e.payload.doc.data().precio,
        idFirebase: e.payload.doc.id
        }
      })
    },
    error => {
      console.error(error);
    }
   );
  }

  pageChanged(event){
    this.config.currentPage = event;
  }

  eliminar(item:any):void{
    this.firebaseServiceService.deleteAuto(item.idFirebase);
  }

  guardarAuto ():void {
    this.firebaseServiceService.createAuto(this.autoForm.value).then(resp => {
      this.autoForm.reset();
      this.modalService.dismissAll();
    }).catch(error =>{
      console.error(error)
    })
    
  }


  actualizarAuto (){

    if(!isNullOrUndefined(this.idFirebaseActualizar)){
    this.firebaseServiceService.updateAuto(this.idFirebaseActualizar, this.autoForm.value).then(resp => {
      this.autoForm.reset();
      this.modalService.dismissAll();
    }).catch(error => {
      console.error(error);
    });
  }
}

  openEditar(content, item:any) {

    this.autoForm.setValue({
      id: item.id,
      marca: item.marca,
      modelo: item.modelo,
      anio: item.anio,
      precio: item.precio
    });
    this.idFirebaseActualizar = item.idFirebase;
    this.actualizar = true;


    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }


  open(content) {
    this.actualizar = false;
    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }

  }

}
