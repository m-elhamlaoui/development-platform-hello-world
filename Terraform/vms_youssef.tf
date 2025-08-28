data "oci_core_images" "ubuntu_images" {
  compartment_id           = var.compartment_id
  operating_system         = "Canonical Ubuntu"
  operating_system_version = "22.04"
  shape                    = "VM.Standard.E4.Flex"
  sort_by                  = "TIMECREATED"
  sort_order               = "DESC"
}

data "oci_identity_availability_domains" "ads" {
  compartment_id = var.tenancy_ocid
}

resource "tls_private_key" "ssh_key1" {
  algorithm = "RSA"
  rsa_bits  = 2048
}

# to store the ssh keys generated above
resource "local_file" "private_key" {
  filename = "c:/Users/Youssef/.ssh/ssh_key_projet_hamlaoui"
  content  = tls_private_key.ssh_key1.private_key_pem
}

resource "local_file" "public_key" {
  filename = "c:/Users/Youssef/.ssh/ssh_key_projet_hamlaoui.pub"
  content  = tls_private_key.ssh_key1.public_key_openssh
}

# control plane of kubernetes and it wil have also jenkins
resource "oci_core_instance" "contolePlane" {
  availability_domain = data.oci_identity_availability_domains.ads.availability_domains[0].name
  compartment_id      = var.compartment_id
  display_name        = "controlePlane"
  shape               = "VM.Standard.E4.Flex"

  shape_config {
    ocpus         = 2
    memory_in_gbs = 16
  }

  create_vnic_details {
    subnet_id                 = oci_core_subnet.spaceAppSubnet1.id
    assign_public_ip          = true
    assign_private_dns_record = true
  }

  source_details {
    source_type = "image"
    source_id   = data.oci_core_images.ubuntu_images.images[0].id
  }

  metadata = {
    ssh_authorized_keys = tls_private_key.ssh_key1.public_key_openssh
  }
}

resource "oci_core_instance" "machine2" {
  availability_domain = data.oci_identity_availability_domains.ads.availability_domains[0].name
  compartment_id = var.compartment_id
  display_name = "machine2"
  shape = "VM.Standard.E4.Flex"

  shape_config {
    ocpus = 2
    memory_in_gbs = 16
  }

  create_vnic_details {
    subnet_id = oci_core_subnet.spaceAppSubnet1.id
    assign_public_ip = true
    assign_private_dns_record = true
  }

  source_details {
    source_type = "image"
    source_id   = data.oci_core_images.ubuntu_images.images[0].id
  }

  metadata = {
    ssh_authorized_keys = tls_private_key.ssh_key1.public_key_openssh
  }
}
