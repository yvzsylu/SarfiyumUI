import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { CustomerService, CustomerDto } from '../services/customer.service';
import { Cities, City } from '@/app/core/data/turkey-data';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { ToastrService } from 'ngx-toastr'; // Hata/Başarı mesajları için (Opsiyonel ama önerilir)

@Component({
  selector: 'app-customer-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, NgxMaskDirective],
  providers: [provideNgxMask()],
  templateUrl: './customer-edit.component.html',
})
export class CustomerEditComponent implements OnInit {
  private fb = inject(FormBuilder);
  private customerService = inject(CustomerService);
  private router = inject(Router);
  private route = inject(ActivatedRoute); // ID'yi URL'den almak için
  // private toastr = inject(ToastrService); // Eğer projenizde toastr varsa açabilirsiniz

  editForm: FormGroup;
  submitted = false;
  isLoading = false;
  customerId: string | null = null;

  cityList: City[] = Cities;
  districtList: string[] = [];

  constructor() {
    // Edit formunda Password ve User bilgileri yok, sadece Tenant bilgileri var
    this.editForm = this.fb.group({
      id: [''], // Hidden field olarak tutacağız
      name: ['', Validators.required],
      taxNumber: ['', [Validators.required, Validators.minLength(11)]],
      phoneNumber: ['', Validators.required],
      website: [''],
      
      // Adres
      city: ['', Validators.required],
      district: ['', Validators.required],
      zipCode: ['', [Validators.minLength(5)]],
      fullAddress: ['', Validators.required], // Backend'deki 'street' buraya map edilecek
      isActive: [true] // Statü kontrolü (Opsiyonel, formda göstermeyebiliriz)
    });
  }

  ngOnInit() {
    // 1. URL'den ID'yi al
    this.customerId = this.route.snapshot.paramMap.get('id');

    // 2. City değişince District listesini güncelleme dinleyicisi
    this.editForm.get('city')?.valueChanges.subscribe(selectedCityName => {
      this.onCityChange(selectedCityName);
    });

    // 3. Verileri getir
    if (this.customerId) {
      this.loadCustomerData(this.customerId);
    } else {
      this.router.navigate(['/admin/customers/list']);
    }
  }

  loadCustomerData(id: string) {
    this.isLoading = true;
    this.customerService.getById(id).subscribe({
      next: (data: CustomerDto) => {
        // Önce ilçeleri doldurmamız lazım ki patchValue district'i doğru seçebilsin
        if (data.city) {
          const selectedCity = this.cityList.find(c => c.name === data.city);
          this.districtList = selectedCity ? selectedCity.districts : [];
        }

        // Backend 'street' gönderiyor, biz formda 'fullAddress' kullanıyoruz.
        // Maplemeyi yapıyoruz:
        this.editForm.patchValue({
          ...data// Street verisini fullAddress alanına bas
        });

        this.isLoading = false;
      },
      error: (err) => {
        // this.toastr.error('Müşteri bilgileri yüklenemedi');
        this.router.navigate(['/admin/customers/list']);
        this.isLoading = false;
      }
    });
  }

  onCityChange(cityName: string) {
    const selectedCity = this.cityList.find(c => c.name === cityName);
    this.districtList = selectedCity ? selectedCity.districts : [];
    
    // Eğer veri yüklenirken (patchValue) tetikleniyorsa, district'i sıfırlama.
    // Kullanıcı manuel değiştiriyorsa sıfırla.
    // Basit çözüm: Değişim anında district değeri listede yoksa sıfırla.
    const currentDistrict = this.editForm.get('district')?.value;
    if (currentDistrict && !this.districtList.includes(currentDistrict)) {
      this.editForm.get('district')?.setValue('');
    }
  }

  get f() { return this.editForm.controls; }

  onSubmit() {
    this.submitted = true;
    if (this.editForm.invalid) return;

    this.isLoading = true;

    const formVal = this.editForm.value;

    // DTO Hazırlığı
    const updateData: CustomerDto = {
        id: this.customerId!, // ID kesin var
        name: formVal.name,
        taxNumber: formVal.taxNumber,
        phoneNumber: formVal.phoneNumber,
        website: formVal.website,
        city: formVal.city,
        district: formVal.district,
        zipCode: formVal.zipCode,
        fullAddress: formVal.fullAddress, 
        isActive: formVal.isActive
    };

    this.customerService.update(updateData).subscribe({
      next: () => {
        // this.toastr.success('Müşteri başarıyla güncellendi');
        this.router.navigate(['/admin/customers/list']);
      },
      error: (err) => {
        // this.toastr.error('Güncelleme hatası');
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}